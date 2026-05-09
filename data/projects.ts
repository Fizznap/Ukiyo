export type ProjectCategory =
  | 'residential'
  | 'commercial'
  | 'hospitality'
  | 'spa';

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
    image:
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=900&q=80&auto=format&fit=crop',
    tags: ['Penthouse', 'Minimal', 'Open Plan'],
    excerpt:
      'A sky-level residence where warm timber, aged brass, and curated stone create a home that breathes.',
  },
  {
    id: 'malabar-hill-residence',
    name: 'Malabar Hill Residence',
    area: 'Malabar Hill',
    city: 'Mumbai',
    category: 'residential',
    year: 2023,
    sqft: 3600,
    image:
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900&q=80&auto=format&fit=crop',
    tags: ['Heritage Building', 'Luxury', 'Bespoke Furniture'],
    excerpt:
      'Heritage bones, contemporary soul. A 1940s apartment reborn with handcrafted millwork and bespoke upholstery.',
  },
  {
    id: 'worli-sea-view',
    name: 'Worli Sea View',
    area: 'Worli',
    city: 'Mumbai',
    category: 'residential',
    year: 2022,
    sqft: 2800,
    image:
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=900&q=80&auto=format&fit=crop',
    tags: ['Coastal', 'Minimalist', '3BHK'],
    excerpt:
      'The sea becomes art. A minimal palette draws every eye to the Arabian Sea beyond floor-to-ceiling glass.',
  },
  {
    id: 'juhu-boutique-hotel',
    name: 'Juhu Boutique Hotel',
    area: 'Juhu',
    city: 'Mumbai',
    category: 'hospitality',
    year: 2022,
    sqft: 12000,
    image:
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=80&auto=format&fit=crop',
    tags: ['Hotel', '32 Keys', 'F&B'],
    excerpt:
      'Thirty-two rooms, each a mood. A boutique hotel where handloom textiles meet quiet Japanese restraint.',
  },
  {
    id: 'powai-tech-office',
    name: 'Powai Tech Campus',
    area: 'Powai',
    city: 'Mumbai',
    category: 'commercial',
    year: 2023,
    sqft: 8500,
    image:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80&auto=format&fit=crop',
    tags: ['Workplace', 'Biophilic', 'Open Office'],
    excerpt:
      'Where people do their best work. A 350-seat campus designed around light, air, and human rhythm.',
  },
  {
    id: 'andheri-wellness-spa',
    name: 'Kala Wellness Spa',
    area: 'Andheri West',
    city: 'Mumbai',
    category: 'spa',
    year: 2021,
    sqft: 3200,
    image:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=900&q=80&auto=format&fit=crop',
    tags: ['Spa', 'Wellness', 'Zen'],
    excerpt:
      'A city escape carved from stone and silence. Six treatment rooms designed around the ancient art of rest.',
  },
];

export const FILTER_LABELS: Record<string, string> = {
  all: 'All',
  residential: 'Residential',
  commercial: 'Commercial',
  hospitality: 'Hospitality',
  spa: 'Spa & Salon',
};
