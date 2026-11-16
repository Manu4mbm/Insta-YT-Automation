// Build projected SVG paths + places for the India-unification map reel.
import fs from "node:fs";
import { geoMercator, geoPath, geoContains, geoDistance } from "d3-geo";
import { feature } from "topojson-client";

const W = 2000, H = 2400;
const india = JSON.parse(fs.readFileSync("india.json", "utf8"));
for (const f of india.features) f.geometry.coordinates = f.geometry.coordinates.map((p) => p.map((r) => r.slice().reverse()));
const world = JSON.parse(fs.readFileSync("node_modules/world-atlas/countries-50m.json", "utf8"));
const countries = feature(world, world.objects.countries).features;
const rivers = JSON.parse(fs.readFileSync("/tmp/rivers.geojson", "utf8")).features;

const bbox = { type: "Feature", geometry: { type: "Polygon", coordinates: [[[62, 5], [62, 37.5], [98, 37.5], [98, 5], [62, 5]]] } };
const proj = geoMercator().fitExtent([[0, 0], [W, H]], bbox);
const path = geoPath(proj);
const P = (lon, lat) => proj([lon, lat]).map((v) => +v.toFixed(1));

const byId = (id) => countries.find((c) => +c.id === id);
const nb = [4, 364, 156, 524, 64, 104, 144, 512, 784, 682, 50, 586, 762, 795, 860, 417];
const land = nb.map(byId).filter(Boolean).map((f) => path(f)).join(" ");
const pak = path(byId(586));
const bdesh = path(byId(50));
const indiaD = india.features.map((f) => path(f)).join(" ");

// Hand-drawn approximate historical shapes (named as approximate on screen)
const poly = (pts) => ({ type: "Feature", geometry: { type: "Polygon", coordinates: [[...pts, pts[0]]] } });
const hydPts = [[74.6, 19.8], [76.0, 20.6], [78.0, 19.9], [79.9, 19.2], [81.3, 17.8], [80.3, 16.6], [78.3, 16.0], [77.3, 15.2], [76.2, 15.6], [75.0, 17.4], [74.5, 18.6]];
const hyd = path(poly(hydPts));
const junPts = [[69.9, 21.2], [70.3, 21.75], [70.9, 21.8], [71.2, 21.4], [70.9, 20.85], [70.3, 20.8]];
const jun = path(poly(junPts));

// J&K highlight: India composite clipped north of ~32.4N (approximate, labelled as such)
const clip = (geom) => {
  // crude: keep India rings' points but clamp — instead build polygon by sampling India mask
  return geom;
};
const jkPts = [[73.4, 32.6], [74.6, 32.2], [75.5, 32.3], [76.4, 32.9], [77.6, 32.7], [78.4, 32.5], [79.4, 32.6], [80.3, 33.3], [80.0, 35.2], [78.0, 35.6], [77.0, 35.9], [75.6, 36.9], [74.2, 37.0], [72.6, 36.3], [73.8, 34.6], [73.6, 33.6]];
const jk = path(poly(jkPts.slice().reverse()));

const rv = {};
const want = ["Indus", "Ganges", "Yamuna", "Godavari", "Krishna", "Narmada", "Brahmaputra", "Sutlej", "Chenab", "Jhelum", "Mahanadi", "Kaveri", "Tapti", "Chambal"];
for (const f of rivers) {
  const n = f.properties.name || f.properties.name_en || "";
  const k = want.find((w) => n.includes(w));
  if (!k) continue;
  const d = path(f);
  if (!d) continue;
  rv[k] = (rv[k] ? rv[k] + " " : "") + d;
}

// 565 princely-state dots, denser where states were densest (Kathiawar, Rajputana, Central India, Punjab hills, Orissa)
let s = 7;
const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
const clusters = [
  [70.6, 21.9, 1.6, 140], [74.5, 26.0, 3.2, 70], [77.5, 23.6, 3.0, 80], [76.8, 31.2, 1.4, 40],
  [84.5, 20.8, 2.0, 40], [73.5, 17.5, 2.0, 30], [72.8, 22.8, 1.5, 40], [76.0, 12.5, 2.0, 15],
  [81.5, 22.5, 2.6, 45], [86.0, 24.5, 2.0, 15], [91.8, 25.0, 1.4, 22], [78.5, 28.0, 2.0, 25],
];
const india0 = india.features[0];
const avoid = [[78.47, 17.38, 2.4], [70.46, 21.52, 0.5], [75.0, 34.0, 2.4]];
const dots = []; const R={c:0,a:0,d:0};
for (const [lon, lat, r, n] of clusters) {
  let k = 0, tries = 0;
  while (k < n && tries < 20000) {
    tries++;
    const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * r;
    const p = [lon + Math.cos(a) * d, lat + Math.sin(a) * d * 0.85];
    if (!geoContains(india0, p)) { R.c++; continue; }
    if (avoid.some(([x, y, rr]) => Math.hypot(p[0] - x, p[1] - y) < rr)) { R.a++; continue; }
    const [x, y] = proj(p);
    if (dots.some((q) => Math.hypot(q.x - x, q.y - y) < 9)) { R.d++; continue; }
    dots.push({ x: +x.toFixed(1), y: +y.toFixed(1), dd: +(geoDistance(p, [77.21, 28.61]) * 6371).toFixed(0) });
    k++;
  }
  console.log(lon,lat,k,tries,JSON.stringify(R));
}
while (dots.length > 562) dots.pop();

const places = {
  delhi: P(77.21, 28.61), hyd: P(78.47, 17.38), jun: P(70.46, 21.52), srinagar: P(74.8, 34.08),
  jaipur: P(75.79, 26.91), bhopal: P(77.41, 23.26), mysore: P(76.64, 12.3), baroda: P(73.18, 22.31), travancore: P(76.95, 8.5),
  gwalior: P(78.18, 26.22), sholapur: P(75.9, 17.68), vijayawada: P(80.65, 16.5), jammu: P(74.86, 32.73),
  karachi: P(67.0, 24.86), lahore: P(74.34, 31.55), dhaka: P(90.41, 23.81),
  pakW: P(69.0, 28.6), pakE: P(90.3, 23.0), indiaL: P(79.5, 22.4), arab: P(66.5, 15.5), bay: P(88.0, 15.0),
  hydL: P(77.9, 18.4), jkL: P(76.2, 34.7), junL: P(70.5, 21.3),
  junagadhIn: P(70.5, 21.6),
};
// Himalaya + Western Ghats hachure spines
const spine = (pts) => pts.map(([a, b]) => P(a, b));
const hills = {
  himalaya: spine([[73.0, 35.6], [74.8, 34.5], [76.5, 33.2], [78.4, 31.6], [80.2, 30.3], [82.5, 29.0], [84.8, 28.2], [87.0, 27.8], [89.5, 27.6], [92.0, 27.9], [94.5, 28.4]]),
  ghats: spine([[73.6, 20.8], [73.7, 18.8], [74.0, 16.6], [74.6, 14.4], [75.5, 12.4], [76.6, 10.4], [77.2, 8.6]]),
  vindhya: spine([[74.4, 23.4], [76.4, 23.0], [78.4, 23.3], [80.4, 23.5]]),
};

fs.writeFileSync("src/geo.json", JSON.stringify({ W, H, land, pak, bdesh, india: indiaD, hyd, jun, jk, rivers: rv, dots, places, hills }));
console.log("dots", dots.length, "rivers", Object.keys(rv), "bytes", fs.statSync("src/geo.json").size);
