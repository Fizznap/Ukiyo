/**
 * Mumbai area data — used in Phase 3 dynamic routes
 * /projects/[area]/page.tsx
 *
 * Swap project IDs for real data later; structure is final.
 */

export interface Area {
  id: string;
  slug: string;
  name: string;
  description: string;
  projectIds: string[];   // references projects.ts ids
  coverImage: string;
  coordinates: { lat: number; lng: number };
}

export const areas: Area[] = [
  {
    id: 'bandra',
    slug: 'bandra',
    name: 'Bandra',
    description: 'Where old Bombay charm meets contemporary ambition. Bandra is our most requested neighbourhood — every client here wants something that honours the character of the area while feeling unmistakably now.',
    projectIds: ['bandra-penthouse'],
    coverImage: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=1200&q=80&auto=format&fit=crop',
    coordinates: { lat: 19.0596, lng: 72.8295 },
  },
  {
    id: 'malabar-hill',
    slug: 'malabar-hill',
    name: 'Malabar Hill',
    description: 'Mumbai\'s most storied residential address. Heritage buildings, sea-facing views, and clients who have lived with beautiful things long enough to know exactly what they want.',
    projectIds: ['malabar-hill-residence'],
    coverImage: 'https://images.unsplash.com/photo-1586016413664-864c0dd76f53?w=1200&q=80&auto=format&fit=crop',
    coordinates: { lat: 18.9548, lng: 72.8074 },
  },
  {
    id: 'worli',
    slug: 'worli',
    name: 'Worli',
    description: 'Sea-link views and sky-high aspirations. Worli is where Mumbai\'s new luxury lives — towers with the drama of the city at their feet and the patience for design that takes its time.',
    projectIds: ['worli-sea-view'],
    coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80&auto=format&fit=crop',
    coordinates: { lat: 19.0178, lng: 72.8149 },
  },
  {
    id: 'juhu',
    slug: 'juhu',
    name: 'Juhu',
    description: 'Beachside living with a creative edge. Juhu clients tend to have strong personalities and stronger opinions — which is exactly how we like it.',
    projectIds: ['juhu-boutique-hotel'],
    coverImage: 'https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?w=1200&q=80&auto=format&fit=crop',
    coordinates: { lat: 19.0988, lng: 72.8265 },
  },
  {
    id: 'powai',
    slug: 'powai',
    name: 'Powai',
    description: 'Mumbai\'s knowledge district. Corporate campuses and lakeside residences that demand precision, practicality, and the rare ability to be both calm and energising at once.',
    projectIds: ['powai-tech-office'],
    coverImage: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80&auto=format&fit=crop',
    coordinates: { lat: 19.1197, lng: 72.9051 },
  },
  {
    id: 'andheri',
    slug: 'andheri',
    name: 'Andheri',
    description: 'The engine room of Mumbai. Dense, energetic, and full of surprises — Andheri projects are about creating genuine refuge in the middle of the city\'s most relentless neighbourhood.',
    projectIds: ['andheri-wellness-spa'],
    coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80&auto=format&fit=crop',
    coordinates: { lat: 19.1136, lng: 72.8697 },
  },
];
