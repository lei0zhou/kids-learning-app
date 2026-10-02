// Projects world-atlas countries-110m (Natural Earth, public domain) to SVG paths.
// Run from a folder with node_modules: world-atlas, topojson-client, d3-geo.
import fs from 'fs';
import {feature} from 'topojson-client';
import {geoNaturalEarth1, geoPath} from 'd3-geo';
const topo = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-110m.json'));
const fc = feature(topo, topo.objects.countries);
const W = 960, H = 500;
const proj = geoNaturalEarth1().fitExtent([[4, 4], [W - 4, H - 4]], {type: 'Sphere'});
const p = geoPath(proj).digits(1);
const r = v => Math.round(v * 10) / 10;
const countries = fc.features.map((f, i) => {
  // centroid of largest polygon (so France/USA/Norway labels land on the mainland)
  let big = f;
  if (f.geometry.type === 'MultiPolygon') {
    let best = -1;
    for (const poly of f.geometry.coordinates) {
      const g = {type: 'Feature', geometry: {type: 'Polygon', coordinates: poly}};
      const a = p.area(g); if (a > best) { best = a; big = g; }
    }
  }
  return {id: f.id || ('x' + i), name: f.properties.name, d: p(f), c: p.centroid(big).map(r), b: p.bounds(f).flat().map(r), mb: p.bounds(big).flat().map(r), a: Math.round(p.area(f))};
});
const pt = ll => proj(ll).map(r);
const box = (w, s, e, n) => { const [x0, y0] = proj([w, n]), [x1, y1] = proj([e, s]); return [r(x0), r(y0), r(x1 - x0), r(y1 - y0)]; };
const out = {viewBox: [0, 0, W, H], sphere: p({type: 'Sphere'}), countries,
  pt: Object.fromEntries(JSON.parse(process.argv[2] || '[]').map(([k, ll]) => [k, pt(ll)])),
  zooms: {Europe: box(-25, 34, 45, 71), 'Middle East': box(25, 10, 75, 43), 'Central America': box(-95, 5, -60, 25), 'South-East Asia': box(90, -12, 155, 25), 'South America': box(-85, -56, -33, 13), 'Africa': box(-20, -36, 53, 38)}};
fs.writeFileSync(process.argv[3] || 'world_paths.json', JSON.stringify(out));
console.log(countries.length, fs.statSync(process.argv[3] || 'world_paths.json').size);
