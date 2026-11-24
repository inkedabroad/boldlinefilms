import data from './work.json';
export type Project = (typeof data.projects)[number] & { vimeo?: string; mp4?: string; still?: string };
const all = data.projects as Project[];
export const hasVideo = (p: Project) => Boolean(p.youtube || p.vimeo || p.mp4);
export const hasImage = (p: Project) => Boolean(p.poster || p.still || p.youtube);
export const ready = (p?: Project): p is Project => Boolean(p && hasVideo(p) && hasImage(p));
export const projects = all.filter(ready);
export const bySlug = (s: string) => all.find((p) => p.slug === s);
export const featured = data.featuredOrder.map(bySlug).find(ready)!;
export const selected = data.selected.map(bySlug).filter(ready);
export const relatedTo = (p: Project) => (p.related || []).map(bySlug).filter(ready);
export const seriesLink = data.seriesLink;
export const posterOf = (p: Project) => p.poster || p.still || (p.youtube ? `https://i.ytimg.com/vi/${p.youtube}/maxresdefault.jpg` : '');
export const stillOf = (p: Project) => p.still || (p.youtube ? `https://i.ytimg.com/vi/${p.youtube}/maxresdefault.jpg` : '') || p.poster;
const vimeoParts = (v: string) => { const m = v.match(/(\d+)(?:\/([0-9a-f]+)|.*[?&]h=([0-9a-f]+))?/); return m ? { id: m[1], h: m[2] || m[3] || '' } : null; };
export const embedOf = (p: Project) => {
  if (p.vimeo) { const v = vimeoParts(p.vimeo); if (v) return `https://player.vimeo.com/video/${v.id}?autoplay=1&playsinline=1&title=0&byline=0&portrait=0${v.h ? `&h=${v.h}` : ''}`; }
  if (p.youtube) return `https://www.youtube-nocookie.com/embed/${p.youtube}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;
  return '';
};
export const watchLinkOf = (p: Project) => {
  if (p.vimeo) { const v = vimeoParts(p.vimeo); if (v) return { href: `https://vimeo.com/${v.id}${v.h ? `/${v.h}` : ''}`, label: 'Watch on Vimeo' }; }
  if (p.youtube) return { href: `https://www.youtube.com/watch?v=${p.youtube}`, label: 'Watch on YouTube' };
  if (p.mp4) return { href: p.mp4, label: 'Open the video file' };
  return null;
};
export const inquiryType = (p: Project) => ({ convention: 'convention', lbi: 'artist', skit: 'brand', promo: 'business' } as Record<string, string>)[p.kind] || '';
