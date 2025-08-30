-- cards and jobs schema
create table if not exists public.cards (
  id text primary key,
  title text not null,
  list_id text not null,
  position int not null default 0,
  description text,
  vector_store_id text, -- OpenAI vector store id per card
  created_at timestamp with time zone default now()
);

create table if not exists public.jobs (
  id bigserial primary key,
  provider text not null check (provider in ('dust','openai','aci')),
  status text not null check (status in ('queued','running','succeeded','failed')),
  job_id text not null,
  card_id text references public.cards(id) on delete set null,
  payload jsonb,
  result jsonb,
  knowledge jsonb, -- snapshot of relevant knowledge used
  created_at timestamp with time zone default now()
);

create index if not exists jobs_card_id_idx on public.jobs(card_id);
create index if not exists jobs_provider_idx on public.jobs(provider);

-- Dust mappings
create table if not exists public.dust_workspaces (
  board_id text primary key,
  workspace_id text not null,
  created_at timestamp with time zone default now()
);

create table if not exists public.dust_spaces (
  card_id text primary key references public.cards(id) on delete cascade,
  workspace_id text not null,
  space_id text not null,
  created_at timestamp with time zone default now()
);

create table if not exists public.dust_datasources (
  card_id text references public.cards(id) on delete cascade,
  workspace_id text not null,
  space_id text not null,
  datasource_id text not null,
  view_id text,
  primary key (card_id, datasource_id)
);

-- Card apps configuration (apps enabled per card)
create table if not exists public.card_apps (
  card_id text references public.cards(id) on delete cascade,
  provider text not null check (provider in ('dust','openai','aci')),
  app_id text,
  config jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  primary key (card_id, provider, coalesce(app_id,'_'))
);

-- Board-level settings (admin-only keys)
create table if not exists public.settings (
  id text primary key, -- e.g., 'board:b1'
  openai_key text,
  dust_key text,
  dust_workspace_id text,
  aci_key text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
