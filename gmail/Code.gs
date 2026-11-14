/**
 * Payment watcher — runs inside the owner's own Gmail (script.google.com). No third-party service.
 * Every minute: reads Kotak UPI credit-alert emails → sends them (HMAC-signed) to our API → API matches
 * the unique amount to an order → API returns delivery emails → this script sends them from the owner's Gmail.
 *
 * One-time setup: ask Claude to "open payment pairing", then within 15 min run setup() once.
 */
const APP = 'https://YOUR-APP.vercel.app'; // ← your Vercel URL
const QUERY = 'from:(kotak.com OR kotak.bank.in) (subject:"UPI Credit" OR subject:"Payment Received" OR subject:credited OR credited) newer_than:1d';

function setup() {
  const r = UrlFetchApp.fetch(APP + '/api/pay/pair', { method: 'post', muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) throw new Error('Pairing closed — ask Claude to open payment pairing, then run setup() again. ' + r.getContentText());
  PropertiesService.getScriptProperties().setProperty('SECRET', JSON.parse(r.getContentText()).secret);
  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('poll').timeBased().everyMinutes(1).create();
  poll(true);
  Logger.log('Paired ✅ — watcher runs every minute.');
}

function sign_(obj) {
  const payload = JSON.stringify(obj), ts = Date.now();
  const key = PropertiesService.getScriptProperties().getProperty('SECRET');
  const raw = Utilities.computeHmacSha256Signature(ts + '.' + payload, key, Utilities.Charset.UTF_8);
  const sig = raw.map(function (b) { return ('0' + (b & 255).toString(16)).slice(-2); }).join('');
  return { ts: ts, payload: payload, sig: sig };
}

function post_(op, obj) {
  const r = UrlFetchApp.fetch(APP + '/api/pay/' + op, {
    method: 'post', contentType: 'application/json', payload: JSON.stringify(sign_(obj)), muteHttpExceptions: true,
  });
  if (r.getResponseCode() !== 200) throw new Error(op + ' ' + r.getResponseCode() + ' ' + r.getContentText());
  return JSON.parse(r.getContentText());
}

function poll(force) {
  force = force === true;
  const cache = CacheService.getScriptCache();
  const alerts = [];
  GmailApp.search(QUERY, 0, 30).forEach(function (th) {
    th.getMessages().forEach(function (m) {
      const id = m.getId();
      if (cache.get('seen:' + id)) return;
      alerts.push({
        id: id, from: m.getFrom(), subject: m.getSubject(), body: m.getPlainBody().slice(0, 3000),
        date: m.getDate().getTime(), auth: m.getHeader('Authentication-Results') || '',
      });
    });
  });
  // Nothing new: still check in every 5 min (UTR claims / manual approvals need their emails sent).
  const minute = new Date().getMinutes();
  if (!alerts.length && !force && minute % 5 !== 0) return;
  const res = post_('alert', { alerts: alerts });
  alerts.forEach(function (a) { cache.put('seen:' + a.id, '1', 21600); });
  const sent = [];
  (res.mail || []).forEach(function (x) {
    try {
      GmailApp.sendEmail(x.to, x.subject, x.body, { name: 'YOUR BRAND' });
      sent.push(x.id);
    } catch (e) { console.log('mail failed ' + x.id + ' ' + e); }
  });
  if (sent.length) post_('mailed', { ids: sent });
}
