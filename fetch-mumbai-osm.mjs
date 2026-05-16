/* One-time fetch of Mumbai roads + coastline from Overpass.
   Produces compact JSON files in public/geo/ that the browser
   loads instead of hitting Overpass at runtime.               */

import { writeFile, mkdir } from 'node:fs/promises';

const BBOX = { west: 72.78, south: 18.88, east: 73.00, north: 19.27 };

const ROADS_QUERY = `[out:json][timeout:60];(way["highway"~"^(motorway|trunk|primary|secondary|tertiary)$"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east}););out geom;`;
const COAST_QUERY = `[out:json][timeout:60];(way["natural"="coastline"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east}););out geom;`;

const HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'User-Agent': 'ukiyo-interior-build/1.0 (atlas globe one-time export)',
};

async function fetchOverpass(query) {
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: 'data=' + encodeURIComponent(query),
    headers: HEADERS,
  });
  if (!res.ok) throw new Error(`Overpass ${res.status} ${res.statusText}`);
  return res.json();
}

await mkdir('public/geo', { recursive: true });

console.log('Fetching roads…');
const roadsRaw = await fetchOverpass(ROADS_QUERY);
console.log('  raw elements:', roadsRaw.elements.length);

/* Compact format: [highway_class, [[lon, lat], ...]]
   highway tier index keeps the file small and the browser parse fast. */
const HW_TIER = ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'residential', 'unclassified'];
const roads = roadsRaw.elements
  .filter((e) => e.type === 'way' && Array.isArray(e.geometry) && e.geometry.length > 1)
  .map((w) => {
    const tier = HW_TIER.indexOf(w.tags?.highway ?? 'unclassified');
    /* Round coords to 5 decimals (~1.1m precision) to shrink file size */
    const line = w.geometry.map((p) => [
      Math.round(p.lon * 1e5) / 1e5,
      Math.round(p.lat * 1e5) / 1e5,
    ]);
    return [tier === -1 ? 6 : tier, line];
  });
console.log('  parsed roads:', roads.length);

await writeFile('public/geo/mumbai-roads.json', JSON.stringify(roads));
console.log('  wrote public/geo/mumbai-roads.json');

console.log('Fetching coastline…');
const coastRaw = await fetchOverpass(COAST_QUERY);
console.log('  raw elements:', coastRaw.elements.length);
const coast = coastRaw.elements
  .filter((e) => e.type === 'way' && Array.isArray(e.geometry) && e.geometry.length > 1)
  .map((w) =>
    w.geometry.map((p) => [
      Math.round(p.lon * 1e5) / 1e5,
      Math.round(p.lat * 1e5) / 1e5,
    ])
  );
console.log('  parsed lines:', coast.length);

await writeFile('public/geo/mumbai-coast.json', JSON.stringify(coast));
console.log('  wrote public/geo/mumbai-coast.json');

console.log('\nDone.');
