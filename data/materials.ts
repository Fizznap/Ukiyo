export interface Material {
  id: string;
  name: string;
  src: string;
}

export const MATERIALS: Material[] = [
  { id: 'mat-1', name: 'Travertine',  src: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=800&q=80&auto=format&fit=crop' },
  { id: 'mat-2', name: 'Aged Brass',  src: 'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800&q=80&auto=format&fit=crop' },
  { id: 'mat-3', name: 'Raw Linen',   src: 'https://images.unsplash.com/photo-1528458909336-e7a0adfed0a5?w=800&q=80&auto=format&fit=crop' },
  { id: 'mat-4', name: 'Walnut',      src: 'https://images.unsplash.com/photo-1601760562234-9814eea6663a?w=800&q=80&auto=format&fit=crop' },
];
