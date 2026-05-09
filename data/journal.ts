export interface JournalEntry {
  id: string;
  slug: string;
  tag: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: string; // Unsplash URL — warm-toned
}

export const journal: JournalEntry[] = [
  {
    id: 'wabi-sabi-mumbai',
    slug: 'wabi-sabi-in-mumbai-apartments',
    tag: 'Design Philosophy',
    title: 'Wabi-Sabi in the Mumbai Apartment',
    excerpt:
      'How the Japanese acceptance of imperfection is reshaping how we design for India\'s most demanding city — and why rough plaster and unlacquered brass feel more alive than perfection.',
    date: 'April 2024',
    readTime: '6 min read',
    image:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80&auto=format&fit=crop',
  },
  {
    id: 'light-as-material',
    slug: 'light-as-a-material-not-an-afterthought',
    tag: 'Craft',
    title: 'Light as a Material, Not an Afterthought',
    excerpt:
      'Most interiors treat lighting as the last decision. We treat it as the first. A look at how natural and artificial light define emotion in a space long before furniture arrives.',
    date: 'February 2024',
    readTime: '5 min read',
    image:
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80&auto=format&fit=crop',
  },
  {
    id: 'stone-selection-guide',
    slug: 'choosing-natural-stone-a-designers-guide',
    tag: 'Materials',
    title: 'Choosing Natural Stone: A Designer\'s Guide',
    excerpt:
      'Marble, quartzite, limestone, onyx — each tells a different story. Our guide to selecting natural stone that will age beautifully, not just photograph well on the day of handover.',
    date: 'December 2023',
    readTime: '8 min read',
    image:
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80&auto=format&fit=crop',
  },
];
