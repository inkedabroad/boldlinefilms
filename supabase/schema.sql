-- Studio HQ database. Run once in Supabase: SQL Editor > New query > paste > Run.

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  group_type text not null default 'local-business',
  package text,
  status text not null default 'lead',
  profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  kind text not null default 'strategy',
  title text,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists plans_client_idx on plans(client_id, created_at desc);

-- Lock both tables. Only the server (service role key) can read or write.
alter table clients enable row level security;
alter table plans enable row level security;
