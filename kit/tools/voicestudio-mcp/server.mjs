#!/usr/bin/env node
// VoiceStudio MCP server (stdio, no dependencies).
// Lets Claude generate voiceovers through the local VoiceStudio app (OpenAI-compatible API).
// Jobs run in the background so slow generations never time out the tool call:
//   voicestudio_generate -> returns job_id immediately; voicestudio_job -> poll status.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const KIT = path.resolve(HERE, "..", "..");                 // AI-Reels-Automation-Kit root
const BASE = (process.env.VOICESTUDIO_URL || "http://localhost:3900").replace(/\/$/, "");
const DEF_VOICE = process.env.VOICESTUDIO_VOICE || "PTS Narrator (D)";
const DEF_MODEL = process.env.VOICESTUDIO_MODEL || "voicestudio";
const DEF_LANG = process.env.VOICESTUDIO_LANGUAGE || "hi";
const FFMPEG = process.env.FFMPEG || "ffmpeg";
const jobs = new Map();
const log = (...a) => process.stderr.write(a.join(" ") + "\n");

function inKit(p) {
  const abs = path.resolve(KIT, p);
  if (!abs.startsWith(KIT)) throw new Error("Path must be inside the kit folder: " + KIT);
  return abs;
}
function chunkText(text, max = 220) {
  const parts = text.replace(/\r/g, "").split(/(?<=[।.!?])\s+|\n+/).map(s => s.trim()).filter(Boolean);
  const out = []; let cur = "";
  for (const s of parts) {
    if ((cur + " " + s).trim().length > max && cur) { out.push(cur); cur = s; }
    else cur = (cur + " " + s).trim();
  }
  if (cur) out.push(cur);
  return out;
}
async function speak(text, o) {
  const body = { model: o.model, voice: o.voice, input: text, response_format: "wav", speed: o.speed };
  if (o.language) body.language = o.language;
  const r = await fetch(`${BASE}/v1/audio/speech`, {
    method: "POST",
    headers: { Authorization: "Bearer local", "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(o.timeoutMin * 60 * 1000),
  });
  if (!r.ok) throw new Error(`VoiceStudio HTTP ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return Buffer.from(await r.arrayBuffer());
}
async function runJob(job) {
  try {
    const dir = path.join(path.dirname(job.out), ".vs-chunks-" + job.id);
    fs.mkdirSync(dir, { recursive: true });
    const files = [];
    for (let i = 0; i < job.chunks.length; i++) {
      job.status = `generating chunk ${i + 1}/${job.chunks.length}`;
      const f = path.join(dir, `c${String(i).padStart(3, "0")}.wav`);
      if (!fs.existsSync(f)) fs.writeFileSync(f, await speak(job.chunks[i], job.opts));
      files.push(f); job.done = i + 1;
    }
    job.status = "joining";
    const list = path.join(dir, "list.txt");
    fs.writeFileSync(list, files.map(f => `file '${f.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`).join("\n"));
    const af = job.opts.normalize ? ["-af", "loudnorm=I=-16:TP=-1.5:LRA=11"] : [];
    const r = spawnSync(FFMPEG, ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", list, "-ac", "1", "-ar", "44100", ...af, job.out], { encoding: "utf8" });
    if (r.status !== 0) throw new Error("ffmpeg failed: " + (r.stderr || r.error));
    const p = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", job.out], { encoding: "utf8" });
    job.duration = parseFloat(p.stdout) || null;
    job.status = "done"; job.finished = new Date().toISOString();
  } catch (e) { job.status = "error"; job.error = String(e.message || e); }
}

const TOOLS = [
  { name: "voicestudio_health", description: "Check that the local VoiceStudio app/engine is reachable.", inputSchema: { type: "object", properties: {} } },
  { name: "voicestudio_voices", description: "List voices/profiles available in VoiceStudio.", inputSchema: { type: "object", properties: {} } },
  { name: "voicestudio_generate", description: "Start a background voiceover job. Give `text` or `text_file` (path inside the kit). Long text is split into sentence chunks, generated one by one (resumable), joined and loudness-normalised into `out_path` (WAV, inside the kit). Returns job_id at once; poll with voicestudio_job.",
    inputSchema: { type: "object", properties: {
      text: { type: "string" }, text_file: { type: "string", description: "e.g. video-studio/animo-kit/projects/<id>/voice.txt" },
      out_path: { type: "string", description: "e.g. video-studio/animo-kit/public/reels/<id>/vo.wav" },
      voice: { type: "string", description: `default ${DEF_VOICE}` }, language: { type: "string", description: `default ${DEF_LANG}` },
      model: { type: "string" }, speed: { type: "number" }, chunk_chars: { type: "number", description: "max characters per chunk (default 220)" },
      timeout_min_per_chunk: { type: "number", description: "default 20" }, normalize: { type: "boolean", description: "default true" } },
      required: ["out_path"] } },
  { name: "voicestudio_job", description: "Status of a voicestudio_generate job (or all jobs if job_id omitted).", inputSchema: { type: "object", properties: { job_id: { type: "string" } } } },
];

async function callTool(name, a = {}) {
  if (name === "voicestudio_health") {
    const r = await fetch(`${BASE}/health`, { signal: AbortSignal.timeout(10000) }).catch(e => ({ ok: false, statusText: e.message }));
    return r.ok ? `VoiceStudio reachable at ${BASE}: ${await r.text()}` : `VoiceStudio NOT reachable at ${BASE} (${r.statusText}). Open the app and wait for the engine.`;
  }
  if (name === "voicestudio_voices") {
    const r = await fetch(`${BASE}/v1/audio/voices`, { signal: AbortSignal.timeout(15000) });
    return await r.text();
  }
  if (name === "voicestudio_generate") {
    const text = a.text || (a.text_file ? fs.readFileSync(inKit(a.text_file), "utf8") : "");
    if (!text.trim()) throw new Error("No text given (text or text_file).");
    const out = inKit(a.out_path); fs.mkdirSync(path.dirname(out), { recursive: true });
    const id = Date.now().toString(36);
    const job = { id, out, chunks: chunkText(text, a.chunk_chars || 220), done: 0, status: "queued", started: new Date().toISOString(),
      opts: { voice: a.voice || DEF_VOICE, language: a.language ?? DEF_LANG, model: a.model || DEF_MODEL, speed: a.speed || 1,
              timeoutMin: a.timeout_min_per_chunk || 20, normalize: a.normalize !== false } };
    jobs.set(id, job); runJob(job);
    return JSON.stringify({ job_id: id, chunks: job.chunks.length, out, voice: job.opts.voice, language: job.opts.language });
  }
  if (name === "voicestudio_job") {
    const pick = j => ({ job_id: j.id, status: j.status, done: j.done, total: j.chunks.length, out: j.out, duration_s: j.duration, error: j.error, started: j.started, finished: j.finished });
    if (a.job_id) { const j = jobs.get(a.job_id); if (!j) throw new Error("Unknown job_id (server may have restarted; re-run generate, finished chunks are reused only with same job)."); return JSON.stringify(pick(j)); }
    return JSON.stringify([...jobs.values()].map(pick));
  }
  throw new Error("Unknown tool " + name);
}

const send = m => process.stdout.write(JSON.stringify(m) + "\n");
let buf = "";
process.stdin.on("data", async d => {
  buf += d; let i;
  while ((i = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
    if (!line) continue;
    let m; try { m = JSON.parse(line); } catch { continue; }
    if (m.id === undefined) continue; // notification
    try {
      if (m.method === "initialize") send({ jsonrpc: "2.0", id: m.id, result: { protocolVersion: m.params?.protocolVersion || "2025-06-18", capabilities: { tools: {} }, serverInfo: { name: "voicestudio", version: "1.0.0" } } });
      else if (m.method === "tools/list") send({ jsonrpc: "2.0", id: m.id, result: { tools: TOOLS } });
      else if (m.method === "tools/call") {
        try { const t = await callTool(m.params.name, m.params.arguments); send({ jsonrpc: "2.0", id: m.id, result: { content: [{ type: "text", text: t }] } }); }
        catch (e) { send({ jsonrpc: "2.0", id: m.id, result: { content: [{ type: "text", text: "Error: " + (e.message || e) }], isError: true } }); }
      }
      else if (m.method === "ping") send({ jsonrpc: "2.0", id: m.id, result: {} });
      else send({ jsonrpc: "2.0", id: m.id, error: { code: -32601, message: "Method not found" } });
    } catch (e) { log(e.stack); }
  }
});
log(`voicestudio MCP ready (kit=${KIT}, api=${BASE})`);
