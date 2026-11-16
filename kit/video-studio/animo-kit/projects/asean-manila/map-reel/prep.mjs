import fs from "node:fs";
import { geoMercator, geoPath, geoInterpolate, geoDistance, geoCentroid } from "d3-geo";
import { feature } from "topojson-client";

const W = 3000, H = 2400;
const india = JSON.parse(fs.readFileSync("india.json", "utf8"));
for (const f of india.features) f.geometry.coordinates = f.geometry.coordinates.map((p) => p.map((r) => r.slice().reverse()));
const world = JSON.parse(fs.readFileSync("world-clip.json", "utf8"));
const countries = feature(world, world.objects.countries).features;

const bbox = { type: "Feature", geometry: { type: "Polygon", coordinates: [[[64, -12], [64, 37], [132, 37], [132, -12], [64, -12]]] } };
const proj = geoMercator().fitExtent([[0, 0], [W, H]], bbox);
const path = geoPath(proj);
const P = (lon, lat) => proj([lon, lat]).map((v) => +v.toFixed(1));

const ASEAN = [
  // id, label, label lon/lat, join order note
  ["608", "PHILIPPINES", 122.0, 12.0], ["360", "INDONESIA", 113.5, -1.5], ["704", "VIETNAM", 108.6, 14.2], ["764", "THAILAND", 101.0, 15.6],
  ["458", "MALAYSIA", 102.2, 4.2], ["702", "SINGAPORE", 103.8, 1.35], ["104", "MYANMAR", 96.0, 21.5], ["116", "CAMBODIA", 104.6, 12.3],
  ["418", "LAOS", 102.4, 20.2], ["096", "BRUNEI", 114.7, 4.6], ["626", "TIMOR-LESTE", 125.8, -8.8],
];
const asean = ASEAN.map(([id, name, lon, lat]) => {
  const f = countries.find((c) => c.id === id);
  return { id, name, d: path(f), l: P(lon, lat) };
});
const skip = new Set(ASEAN.map((a) => a[0]).concat(["356"]));
const others = countries.filter((c) => !skip.has(c.id)).map((c) => path(c)).filter(Boolean).join(" ");

const delhi = [77.21, 28.61], manila = [120.98, 14.6];
const gi = geoInterpolate(delhi, manila);
const route = Array.from({ length: 121 }, (_, i) => P(...gi(i / 120)));
const km = Math.round(geoDistance(delhi, manila) * 6371);

// maritime lanes (illustrative): Indian Ocean -> Malacca -> South China Sea -> Manila
const lane = [[72.8, 18.9], [80.6, 5.2], [92.0, 6.0], [98.5, 5.2], [103.8, 1.3], [108.0, 6.5], [116.0, 11.5], [120.9, 14.5]].map(([a, b]) => P(a, b));

const places = {
  delhi: P(...delhi), manila: P(...manila), india: P(78.5, 22.5), jakarta: P(106.8, -6.2), hanoi: P(105.8, 21.0),
  phnompenh: P(102.7, 6.4), malacca: P(100.5, 3.0), bay: P(88.5, 15.0), arab: P(66.8, 14.0), ocean: P(84.0, -5.0), scs: P(114.0, 15.5),
};

fs.writeFileSync("src/geo.json", JSON.stringify({ W, H, others, india: india.features.map((f) => path(f)).join(" "), asean, route, km, lane, places }));
console.log("km", km, "bytes", fs.statSync("src/geo.json").size, places.delhi, places.manila);
