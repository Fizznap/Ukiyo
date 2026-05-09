export interface Service {
  id: string;
  number: string;
  name: string;
  tagline: string;
  description: string;
  deliverables: string[];
}

export const services: Service[] = [
  {
    id: 'residential-design',
    number: '01',
    name: 'Residential Design',
    tagline: 'Your home, elevated.',
    description:
      'From a single room to a complete residence, we craft living spaces that reflect who you are and how you want to feel every morning you wake up inside them. Every material, every proportion is chosen with intent.',
    deliverables: [
      'Space planning & concept',
      'Material & finish selection',
      'Furniture curation',
      'Lighting design',
      'Project coordination',
    ],
  },
  {
    id: 'commercial-interiors',
    number: '02',
    name: 'Commercial Interiors',
    tagline: 'Spaces that perform.',
    description:
      'Offices, retail, and co-working environments designed around human behaviour. We create commercial spaces that improve performance, attract talent, and communicate your brand without a single word.',
    deliverables: [
      'Workplace strategy',
      'Brand-aligned spatial design',
      'Ergonomic planning',
      'Signage & wayfinding',
      'Turnkey execution',
    ],
  },
  {
    id: 'hospitality-design',
    number: '03',
    name: 'Hospitality Design',
    tagline: 'Experiences guests remember.',
    description:
      'Hotels, restaurants, and resorts designed to create emotional memory. We understand the choreography of hospitality — the moment a guest arrives, to the moment they leave, already planning their return.',
    deliverables: [
      'Concept & mood development',
      'F&B spatial design',
      'Guest room design',
      'FF&E specification',
      'Site supervision',
    ],
  },
  {
    id: 'spa-salon-design',
    number: '04',
    name: 'Spa & Salon Design',
    tagline: 'The architecture of calm.',
    description:
      'Wellness spaces demand a different kind of attention. We design spas and salons where every surface, scent path, and acoustic detail works in harmony to produce genuine tranquillity.',
    deliverables: [
      'Sensory experience planning',
      'Treatment room design',
      'Reception & retail zones',
      'Acoustic & lighting strategy',
      'Material selection',
    ],
  },
  {
    id: 'turnkey-execution',
    number: '05',
    name: 'Turnkey Execution',
    tagline: 'One point of contact. Zero compromise.',
    description:
      'Design without execution is just a drawing. We manage the complete project from approved drawings to handover — contractors, timelines, quality control, and the ten thousand details in between.',
    deliverables: [
      'Contractor coordination',
      'Budget management',
      'Site visits & QC',
      'MEP coordination',
      'Handover documentation',
    ],
  },
  {
    id: 'design-consultation',
    number: '06',
    name: 'Design Consultation',
    tagline: 'Clarity before commitment.',
    description:
      'Not every project needs a full brief. A focused consultation session gives you a professional perspective on layout, materials, and direction — so you move forward with confidence, not guesswork.',
    deliverables: [
      '2-hour design session',
      'Space assessment report',
      'Material mood board',
      'Vendor recommendations',
      'Priority action list',
    ],
  },
];
