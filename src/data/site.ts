/** Site wide facts. One source of truth for every page. */
export const site = {
  name: 'Dakota Weik',
  roles: ['Ethnographer', 'Filmmaker'],
  studio: 'Inked Abroad',
  city: 'Philadelphia, Pennsylvania',
  email: 'info@inkedabroad.com',
  tagline: 'Documenting the tattoo world through cinematic storytelling.',
  url: 'https://inkedabroadfilm.com',
} as const;

export const nav = [
  { href: '/', label: 'Life Beyond Ink' },
  { href: '/portfolio/', label: 'Portfolio' },
  { href: '/conventions/', label: 'Conventions' },
  { href: '/about/', label: 'About' },
  { href: '/contact/', label: 'Contact' },
] as const;
