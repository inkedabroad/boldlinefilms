import type { ImageMetadata } from 'astro';

/**
 * Every film on the site lives in this file.
 * To add a film: add an entry, then drop its poster in src/assets/posters/<id>.webp.
 * A film with a YouTube id links straight to YouTube. A film with only `url` links there.
 */
export interface Film {
  /** Matches the poster file name in src/assets/posters. */
  id: string;
  title: string;
  /** Artist, event or client. */
  subject: string;
  place?: string;
  runtime?: string;
  description?: string;
  youtube?: string;
  /** Leads the Portfolio page at full width. */
  featured?: boolean;
  /** Full Vimeo share link. Plays on the site. */
  vimeo?: string;
  /** Any other watch link, used when there is no YouTube id. */
  url?: string;
}

const posterFiles = import.meta.glob<{ default: ImageMetadata }>('../assets/posters/*.{webp,jpg,jpeg,png}', { eager: true });
const posters = new Map(
  Object.entries(posterFiles).map(([path, mod]) => [path.split('/').pop()!.replace(/\.\w+$/, ''), mod.default]),
);

export const posterOf = (film: Film): ImageMetadata | undefined => posters.get(film.id);
/** Player address for a Vimeo share link, including the private hash when the link has one. */
export const vimeoEmbed = (film: Film): string | undefined => {
  const match = film.vimeo?.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([0-9a-f]+))?/);
  if (!match) return undefined;
  const [, id, hash] = match;
  const params = new URLSearchParams({ ...(hash ? { h: hash } : {}), title: '0', byline: '0', portrait: '0', dnt: '1' });
  return `https://player.vimeo.com/video/${id}?${params}`;
};
export const watchUrl = (film: Film): string | undefined =>
  film.youtube ? `https://www.youtube.com/watch?v=${film.youtube}` : film.url || undefined;
/** Remote thumbnail, used only while a film has no poster file. */
export const fallbackThumb = (film: Film): string | undefined =>
  film.youtube ? `https://i.ytimg.com/vi/${film.youtube}/hqdefault.jpg` : undefined;

export const lifeBeyondInk: Film[] = [
  { id: 'paul-booth', title: 'The Prince of Dark Tattooing', subject: 'Paul Booth', runtime: '26 min', youtube: 'SjkT-VwLgZo',
    description: 'Dakota enters the world of Paul Booth, the Prince of Darkness of tattooing.' },
  { id: 'kari-barba', title: 'The Woman Who Changed Tattooing', subject: 'Kari Barba', runtime: '31 min', youtube: '2o8NyUlzCO4',
    description: 'Inside the oldest tattoo shop in America with the woman who saved it.' },
  { id: 'jacci-gresham', title: "America's First Black Female Tattooer", subject: 'Jacci Gresham', runtime: '27 min', youtube: 'PXi0x8pNdrE',
    description: 'A weekend on the ranch of the first Black woman to tattoo professionally in the United States.' },
  { id: 'murray-brothers', title: 'Tattoos for the Grim Hearted', subject: 'The Murray Brothers', runtime: '18 min', youtube: '5Ohft0apssg',
    description: "Identical twins making black and gray work rooted in Salem's dark history." },
  { id: 'gill-montie', title: 'The Story of the Tattoo Man', subject: 'Gill Montie', runtime: '25 min', youtube: 'XA6xculqbno',
    description: 'More than fifty years of tattooing, told over one weekend at the home of The Drill.' },
  { id: 'sergey-fedotov', title: 'The Rugged Ramblers', subject: 'Sergey Fedotov', runtime: '23 min', youtube: 'XAuIb4JUdus',
    description: 'A Moscow born artist finding freedom on the forgotten highways of America.' },
  { id: 'amanda-graves', title: 'The Girl Behind the Glitter', subject: 'Amanda Graves', runtime: '25 min', youtube: 'bwBufwU7Hxs',
    description: 'The artist who pioneered the glitter realism tattoo.' },
];

export const conventions: Film[] = [
  { id: 'mondial-du-tatouage', title: 'Mondial du Tatouage: The Last Show', subject: 'Mondial du Tatouage', place: 'Paris, France', runtime: '22 min', youtube: 'irYW4juk8tE',
    description: 'The story of Mondial du Tatouage and the man who built it, told by its legendary judging panel.' },
  { id: 'bucharest-convention', title: 'The Bucharest Tattoo Convention', subject: 'Bucharest Tattoo Convention', place: 'Bucharest, Romania', runtime: '13 min', youtube: '8ehAXXBcGGM',
    description: 'A convention in Romania that turned into a road trip through the Carpathians.' },
  { id: 'belfast', title: 'Belfast Tattoo Convention', subject: 'Belfast Tattoo Convention', place: 'Belfast, Northern Ireland', runtime: '18 min', youtube: 'P08_JbAN-5w',
    description: 'A tattoo convention inside the hotel that survived more than 30 bombings during The Troubles.' },
  { id: 'nordic-tattoo-moot', title: 'The Nordic Tattoo Moot', subject: 'Nordic Tattoo Moot', place: 'York, England', runtime: '14 min', youtube: 'UxL8GxBZ64I',
    description: 'The Nordic tattooers of the world gather in the city the Vikings called Jorvik.' },
];

/**
 * Shorts from all of Dakota's filming. Each entry needs a Vimeo link, a title and a brand.
 * Waiting on links: Dakota Joins Dr. Pickles (Dr. Pickles), EZ Machine: Chinese Magic (EZ Tattoo),
 * Fistful of Fun (A Pound of Flesh),
 * Lugano Royale (Lugano Tattoo Convention), Say It!! (Austin Invitational).
 */
export const portfolio: Film[] = [
  { id: 'austin-invitational-promo', title: 'Austin Invitational Promo', subject: '', featured: true, vimeo: 'https://vimeo.com/1249780840/caf5891f8a' },
  { id: 'the-boys-struck-gold', title: 'The Boys Struck Gold', subject: 'EZ Tattoo Machine', vimeo: 'https://vimeo.com/1249776333/d0b7f2caa2' },
  { id: 'the-tattoo-robot', title: 'The Tattoo Robot', subject: 'Scripted Skit', vimeo: 'https://vimeo.com/1249776428/9220f2b203' },
  { id: 'richmond-convention-promo', title: 'Richmond Convention Promo', subject: 'Scripted Skit', vimeo: 'https://vimeo.com/1249778289/20be994002' },
  { id: 'richmond-convention-teaser', title: 'Richmond Tattoo Convention Teaser', subject: 'Life Beyond Ink', vimeo: 'https://vimeo.com/1249777027/acebef1232' },
  { id: 'formosa-convention-promo', title: 'Formosa Convention Promo', subject: '', vimeo: 'https://vimeo.com/1165028381/bedd121239' },
  { id: 'paul-booth-teaser', title: 'Paul Booth Teaser', subject: 'Life Beyond Ink', vimeo: 'https://vimeo.com/1249781404/b120314e2a' },
  { id: 'paul-booth-teaser-2', title: 'Paul Booth Teaser', subject: 'Life Beyond Ink', vimeo: 'https://vimeo.com/1249781405/b2a60e70d4' },
  { id: 'jacci-gresham-teaser', title: 'Jacci Gresham Teaser', subject: 'Life Beyond Ink', vimeo: 'https://vimeo.com/1249777583/342399be7a' },
  { id: 'buscalan-teaser', title: 'Buscalan Teaser', subject: 'Indigenous Revival', vimeo: 'https://vimeo.com/1247773569/20afd40472' },
];
