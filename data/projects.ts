export type ProjectCategory =
  | 'residential'
  | 'commercial'
  | 'hospitality'
  | 'spa';

export interface ProjectMaterial {
  name: string;
  type: string;
  image: string;
  description?: string;
  price?: number;
}

export interface Project {
  id: string;
  name: string;
  area: string;
  city: string;
  category: ProjectCategory;
  year: number;
  sqft: number;
  image: string; // Unsplash URL — warm-toned
  tags: string[];
  excerpt: string;
  heroImage?: string;
  beforeImage?: string;
  afterImage?: string;
  materials?: ProjectMaterial[];
  processImages?: string[];
}

export const projects: Project[] = [
  {
    id: 'bandra-penthouse',
    name: 'The Bandra Penthouse',
    area: 'Bandra West',
    city: 'Mumbai',
    category: 'residential',
    year: 2023,
    sqft: 4200,
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=900&q=80&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1600&q=80&auto=format&fit=crop',
    tags: ['Penthouse', 'Minimal', 'Open Plan'],
    excerpt: 'A sky-level residence where warm timber, aged brass, and curated stone create a home that breathes.',
    beforeImage: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&q=80&auto=format&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=900&q=80&auto=format&fit=crop',
    materials: [
      { name: 'Aged Brass', type: 'Metal', image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=300&q=80&auto=format&fit=crop', description: 'Hand-patinated brass hardware with a rich antique finish. Used across cabinet pulls and light fixtures.', price: 12500 },
      { name: 'Warm Timber', type: 'Wood', image: 'https://images.unsplash.com/photo-1546419448-93f4127042a9?w=300&q=80&auto=format&fit=crop', description: 'Reclaimed teak flooring, hand-rubbed with natural oil for a warm, lived-in feel.', price: 8800 }
    ],
    processImages: [
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?w=600&q=80&auto=format&fit=crop'
    ]
  },
  {
    id: 'malabar-hill-residence',
    name: 'Malabar Hill Residence',
    area: 'Malabar Hill',
    city: 'Mumbai',
    category: 'residential',
    year: 2023,
    sqft: 3600,
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900&q=80&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=1600&q=80&auto=format&fit=crop',
    tags: ['Heritage Building', 'Luxury', 'Bespoke Furniture'],
    excerpt: 'Heritage bones, contemporary soul. A 1940s apartment reborn with handcrafted millwork and bespoke upholstery.',
    beforeImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=900&q=80&auto=format&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900&q=80&auto=format&fit=crop',
    materials: [
      { name: 'Travertine', type: 'Stone', image: 'https://images.unsplash.com/photo-1528659135003-88cd1d46b8a8?w=300&q=80&auto=format&fit=crop', description: 'Roman travertine slabs sourced directly from Tivoli quarries. Honed finish for matte elegance.', price: 22000 }
    ],
    processImages: [
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80&auto=format&fit=crop'
    ]
  },
  {
    id: 'worli-sea-view',
    name: 'Worli Sea View',
    area: 'Worli',
    city: 'Mumbai',
    category: 'residential',
    year: 2022,
    sqft: 2800,
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=900&q=80&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80&auto=format&fit=crop',
    tags: ['Coastal', 'Minimalist', '3BHK'],
    excerpt: 'The sea becomes art. A minimal palette draws every eye to the Arabian Sea beyond floor-to-ceiling glass.',
    beforeImage: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=900&q=80&auto=format&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=900&q=80&auto=format&fit=crop',
    materials: [
      { name: 'Natural Linen', type: 'Fabric', image: 'https://images.unsplash.com/photo-1582299863810-bb2377c8d8b9?w=300&q=80&auto=format&fit=crop', description: 'Belgian stonewashed linen upholstery in sea mist. Breathable and ultra-durable for coastal living.', price: 6200 }
    ],
    processImages: [
      'https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?w=600&q=80&auto=format&fit=crop'
    ]
  },
  {
    id: 'juhu-boutique-hotel',
    name: 'Juhu Boutique Hotel',
    area: 'Juhu',
    city: 'Mumbai',
    category: 'hospitality',
    year: 2022,
    sqft: 12000,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=80&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1600&q=80&auto=format&fit=crop',
    tags: ['Hotel', '32 Keys', 'F&B'],
    excerpt: 'Thirty-two rooms, each a mood. A boutique hotel where handloom textiles meet quiet Japanese restraint.',
    beforeImage: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&q=80&auto=format&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=80&auto=format&fit=crop',
    materials: [
      { name: 'Engineered Bamboo', type: 'Wood', image: 'https://images.unsplash.com/photo-1587841315570-362f7f186c26?w=300&q=80&auto=format&fit=crop', description: 'Carbonised strand bamboo panels. Sustainably sourced, harder than most hardwoods, zero-VOC finish.', price: 4500 }
    ],
    processImages: [
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80&auto=format&fit=crop'
    ]
  },
  {
    id: 'powai-tech-office',
    name: 'Powai Tech Campus',
    area: 'Powai',
    city: 'Mumbai',
    category: 'commercial',
    year: 2023,
    sqft: 8500,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1600&q=80&auto=format&fit=crop',
    tags: ['Workplace', 'Biophilic', 'Open Office'],
    excerpt: 'Where people do their best work. A 350-seat campus designed around light, air, and human rhythm.',
    beforeImage: 'https://images.unsplash.com/photo-1497215898141-8664188b634f?w=900&q=80&auto=format&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80&auto=format&fit=crop',
    materials: [
      { name: 'Polished Concrete', type: 'Floor', image: 'https://images.unsplash.com/photo-1518742217645-31fdf76182ed?w=300&q=80&auto=format&fit=crop', description: 'Seamless polished micro-cement floor. Low-maintenance, thermoregulating, industrial-chic aesthetic.', price: 9500 }
    ],
    processImages: [
      'https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?w=600&q=80&auto=format&fit=crop'
    ]
  },
  {
    id: 'andheri-wellness-spa',
    name: 'Kala Wellness Spa',
    area: 'Andheri West',
    city: 'Mumbai',
    category: 'spa',
    year: 2021,
    sqft: 3200,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=900&q=80&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1600&q=80&auto=format&fit=crop',
    tags: ['Spa', 'Wellness', 'Zen'],
    excerpt: 'A city escape carved from stone and silence. Six treatment rooms designed around the ancient art of rest.',
    beforeImage: 'https://images.unsplash.com/photo-1600607688969-a5bfcd64bd40?w=900&q=80&auto=format&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=900&q=80&auto=format&fit=crop',
    materials: [
      { name: 'River Stone', type: 'Stone', image: 'https://images.unsplash.com/photo-1463123081488-789f998ac9c4?w=300&q=80&auto=format&fit=crop', description: 'Hand-selected river stones from the Western Ghats, used in wet zone accents and feature walls.', price: 3800 }
    ],
    processImages: [
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80&auto=format&fit=crop'
    ]
  }
];

export const FILTER_LABELS: Record<string, string> = {
  all: 'All',
  residential: 'Residential',
  commercial: 'Commercial',
  hospitality: 'Hospitality',
  spa: 'Spa & Salon',
};
