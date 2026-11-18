// Studio HQ API. Runs on Netlify Edge. Every request needs the HQ password.
// Env vars (Netlify > Project configuration > Environment variables):
//   HQ_PASSWORD, ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

const env = (k: string) => Netlify.env.get(k) ?? '';
const MODEL = 'claude-sonnet-5-5';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

async function db(path: string, init: RequestInit = {}) {
  const res = await fetch(`${env('SUPABASE_URL')}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: env('SUPABASE_SERVICE_ROLE_KEY'),
      authorization: `Bearer ${env('SUPABASE_SERVICE_ROLE_KEY')}`,
      'content-type': 'application/json',
      prefer: 'return=representation',
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Database error ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

function safeEqual(a: string, b: string) {
  if (!a || !b || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

const AGENCY = `You are the strategy engine for Inked Abroad Film, a solo creative studio run by Dakota Weik, a tattoo ethnographer, filmmaker and director based in Philadelphia. Dakota is the creative director: he shoots every piece himself with a cinematic eye, then directs strategy, content and social for each client.

Packages Dakota sells:
- Brand Audit, $750 one time (free with a 3 month signup)
- Studio, $1,750/month: 1 shoot, 8 posts (reels and carousels), 4 story sets, content calendar with captions, grid preview, monthly report, WhatsApp support
- Studio Plus, $2,750/month: 2 shoots, 12 posts, 4 story sets, scheduling and posting, calendar, report, WhatsApp
- Shoot only Monthly Content Session, $1,350/month
- Convention Film Package, $6,500
- Director & Cinematographer Day, $1,200

House style for everything you write: plain, direct, confident. Write in positive statements. Never use em dashes or hyphens. Never use the word "documentary"; call Dakota's work films. Be specific to this business: name real dishes, services, people and moments from the profile. Every recommendation should be something Dakota can film or a client can act on.`;

const PROMPTS: Record<string, { title: string; task: string }> = {
  strategy: {
    title: 'Audit & Strategy',
    task: `Write a complete Audit & Strategy plan for this client, ready to send. Use these sections with markdown headings:
# [Business name]: Audit & Strategy
## Where you are now (what works on their current social presence and what to improve: bio, highlights, grid, posting rhythm, video quality)
## Who you're talking to (the audience and what makes them book, buy or visit)
## Competitors to watch (types of local competitors and what to learn from them; mark any names as examples to verify)
## Content pillars (3 or 4 pillars, each with 3 concrete post ideas Dakota can film)
## Visual direction (look, light, color, music and editing feel)
## Your 90 day plan (Month 1, Month 2, Month 3 with goals and key posts)
## How we measure it (2 or 3 numbers to track and how to count real customers)
## Recommended package (which package fits and why, with the price)`,
  },
  calendar: {
    title: 'Monthly Content Calendar',
    task: `Write next month's content calendar for this client as a markdown table with columns: Week, Day, Format (Reel, Carousel or Story set), Pillar, Idea, Caption, Shot list. Plan posts to match their package (8 posts for Studio, 12 for Studio Plus, 4 reels for shoot only), plus 4 story sets. Then add "## Shoot day plan": a timed run of show for Dakota's shoot covering every shot needed for the month.`,
  },
  proposal: {
    title: 'Proposal',
    task: `Write a short, persuasive proposal email from Dakota to this business. Open with one specific observation about their business, give one vivid film idea, recommend one package with its price and what's included, and close with a simple next step (a 15 minute call). Under 250 words. Add a subject line at the top.`,
  },
};

export default async (req: Request) => {
  const url = new URL(req.url);
  const route = url.pathname.replace(/^\/hq\/api\/?/, '');
  if (!safeEqual(req.headers.get('x-hq-key') || '', env('HQ_PASSWORD'))) return json({ error: 'Wrong password' }, 401);

  try {
    if (route === 'login') return json({ ok: true });

    if (route === 'clients' && req.method === 'GET') {
      return json(await db('clients?select=*&order=updated_at.desc'));
    }

    if (route === 'clients' && req.method === 'POST') {
      const body = await req.json();
      const row = {
        name: String(body.name || '').slice(0, 200),
        group_type: body.group_type || 'local-business',
        package: body.package || null,
        status: body.status || 'lead',
        profile: body.profile || {},
        updated_at: new Date().toISOString(),
      };
      if (!row.name) return json({ error: 'Business name is required' }, 400);
      if (body.id) return json((await db(`clients?id=eq.${encodeURIComponent(body.id)}`, { method: 'PATCH', body: JSON.stringify(row) }))[0]);
      return json((await db('clients', { method: 'POST', body: JSON.stringify(row) }))[0]);
    }

    if (route === 'plans' && req.method === 'GET') {
      const id = url.searchParams.get('client') || '';
      return json(await db(`plans?client_id=eq.${encodeURIComponent(id)}&select=*&order=created_at.desc`));
    }

    if (route === 'generate' && req.method === 'POST') {
      const { clientId, kind = 'strategy', notes = '' } = await req.json();
      const p = PROMPTS[kind];
      if (!p) return json({ error: 'Unknown plan type' }, 400);
      const client = (await db(`clients?id=eq.${encodeURIComponent(clientId)}&select=*`))[0];
      if (!client) return json({ error: 'Client not found' }, 404);

      const upstream = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': env('ANTHROPIC_API_KEY'),
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 6000,
          stream: true,
          system: AGENCY,
          messages: [{
            role: 'user',
            content: `Client profile:\n${JSON.stringify({ name: client.name, group: client.group_type, package: client.package, ...client.profile }, null, 2)}\n\n${notes ? `Extra notes from Dakota: ${notes}\n\n` : ''}${p.task}`,
          }],
        }),
      });
      if (!upstream.ok || !upstream.body) return json({ error: `Claude error ${upstream.status}: ${await upstream.text()}` }, 502);

      let full = '';
      const reader = upstream.body.getReader();
      const dec = new TextDecoder();
      const enc = new TextEncoder();
      let buf = '';
      const stream = new ReadableStream({
        async pull(ctrl) {
          const { done, value } = await reader.read();
          if (done) {
            try {
              await db('plans', { method: 'POST', body: JSON.stringify({ client_id: client.id, kind, title: p.title, content: full }) });
              await db(`clients?id=eq.${client.id}`, { method: 'PATCH', body: JSON.stringify({ updated_at: new Date().toISOString() }) });
            } catch (e) { ctrl.enqueue(enc.encode(`\n\n[Saving failed: ${(e as Error).message}]`)); }
            ctrl.close();
            return;
          }
          buf += dec.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop() || '';
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            try {
              const ev = JSON.parse(line.slice(5).trim());
              if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta') {
                full += ev.delta.text;
                ctrl.enqueue(enc.encode(ev.delta.text));
              }
            } catch { /* partial line */ }
          }
        },
      });
      return new Response(stream, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' } });
    }

    return json({ error: 'Not found' }, 404);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
};

export const config = { path: '/hq/api/*' };
