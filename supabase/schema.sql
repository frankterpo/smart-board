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
  app_id text not null,
  config jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  primary key (card_id, provider, app_id)
);

-- Chat messages for agent conversations
create table if not exists public.chat_messages (
  id text primary key,
  card_id text references public.cards(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  provider text not null check (provider in ('openai','dust','aci')),
  timestamp timestamp with time zone default now(),
  metadata jsonb default '{}'::jsonb,
  reasoning text -- Agent's reasoning process for assistant messages
);

-- Chat interactions (for analytics and logging)
create table if not exists public.chat_interactions (
  id text primary key default gen_random_uuid()::text,
  card_id text references public.cards(id) on delete cascade,
  provider text not null,
  user_message text not null,
  assistant_response text not null,
  metadata jsonb default '{}'::jsonb,
  timestamp timestamp with time zone default now()
);

-- Voice transcripts and processing
create table if not exists public.voice_transcripts (
  id text primary key default gen_random_uuid()::text,
  transcript text not null,
  processed_tasks jsonb default '[]'::jsonb,
  confidence real,
  duration real,
  timestamp timestamp with time zone default now()
);

-- Tool mentions and suggestions
create table if not exists public.tool_mentions (
  id text primary key default gen_random_uuid()::text,
  card_id text references public.cards(id) on delete cascade,
  tool_id text not null,
  tool_type text not null check (tool_type in ('aci','dust')),
  context text,
  inserted_at timestamp with time zone default now()
);

-- Board-level settings (admin-only keys)
create table if not exists public.settings (
  id text primary key, -- e.g., 'board:b1'
  openai_key text,
  dust_key text,
  dust_workspace_id text,
  aci_key text,
  elevenlabs_key text, -- Add ElevenLabs API key
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ACI Card Agents (each card gets its own ACI agent)
create table if not exists public.aci_card_agents (
  id text primary key default gen_random_uuid()::text,
  card_id text references public.cards(id) on delete cascade,
  agent_name text not null,
  description text,
  intent text, -- derived from card title/description
  status text not null check (status in ('active','inactive','error')) default 'active',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ACI App Configurations (per card subscriptions)
create table if not exists public.aci_app_configurations (
  id text primary key default gen_random_uuid()::text,
  card_id text references public.cards(id) on delete cascade,
  app_name text not null,
  app_category text,
  security_scheme text not null check (security_scheme in ('API_KEY','OAUTH2','NO_AUTH')),
  configuration jsonb, -- app-specific config
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(card_id, app_name)
);

-- ACI Linked Accounts (user API keys for apps)
create table if not exists public.aci_linked_accounts (
  id text primary key default gen_random_uuid()::text,
  card_id text references public.cards(id) on delete cascade,
  app_name text not null,
  linked_account_owner_id text not null, -- user identifier
  security_scheme text not null check (security_scheme in ('API_KEY','OAUTH2','NO_AUTH')),
  credentials jsonb, -- encrypted API keys/tokens
  is_active boolean default true,
  oauth_state text, -- for OAuth2 flows
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(card_id, app_name, linked_account_owner_id)
);

-- ACI Function Executions (track tool usage)
create table if not exists public.aci_function_executions (
  id text primary key default gen_random_uuid()::text,
  card_id text references public.cards(id) on delete cascade,
  function_name text not null,
  app_name text,
  arguments jsonb,
  result jsonb,
  success boolean,
  error_message text,
  execution_time_ms integer,
  created_at timestamp with time zone default now()
);

-- Indexes for performance
create index if not exists aci_card_agents_card_id_idx on public.aci_card_agents(card_id);
create index if not exists aci_app_configurations_card_id_idx on public.aci_app_configurations(card_id);
create index if not exists aci_linked_accounts_card_id_idx on public.aci_linked_accounts(card_id);
create index if not exists aci_function_executions_card_id_idx on public.aci_function_executions(card_id);
