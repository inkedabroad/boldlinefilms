import raw from './films.json';
import services from './services.json';
export const films = (raw as any[]).filter((f) => !f.draft).sort((a, b) => a.order - b.order);
export const allFilms = raw as any[];
const audienceNames: Record<string, string> = { brands: 'Brands' };
services.forEach((s) => (audienceNames[s.slug] = s.name));
export const audienceName = (slug: string) => audienceNames[slug] || slug;
export const audiences = Object.keys(audienceNames).filter((a) => films.some((f) => f.audiences.includes(a)));
