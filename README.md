# inkedabroadfilm.com

Dakota Weik, Director & Cinematographer. Built with Astro, hosted on Netlify.

## Add or edit a film
Everything lives in `src/data/films.json`.
- `poster`: put the image in `public/media/posters/` and use `/media/posters/name.jpg`
- `video`: `{ "provider": "vimeo", "id": "123456789", "aspect": "16:9" }` (or `youtube`)
- `projectType`: commissioned, original, spec or collaboration
- `featured: true` puts it on the homepage, `order` sets position
- `draft: true` keeps it off the live site

Prices and service text live in `src/data/services.json`. Email, socials, hero image and client names live in `src/data/site.json`.

## Run locally
npm install, then npm run dev
