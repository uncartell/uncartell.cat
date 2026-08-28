create table if not exists public.editor_templates (
  id uuid primary key default gen_random_uuid(),
  tool_type text not null check (tool_type in ('menu','services')),
  format_id text not null,
  name text not null check (char_length(name) between 1 and 100),
  description text not null default '',
  payload jsonb not null default '{}'::jsonb,
  source_project_id text,
  version integer not null default 1 check (version > 0),
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists editor_templates_catalog_idx
  on public.editor_templates (tool_type, format_id, is_published, sort_order, updated_at desc);

alter table public.editor_templates enable row level security;

drop policy if exists "Published editor templates are readable" on public.editor_templates;
create policy "Published editor templates are readable"
  on public.editor_templates for select
  to anon, authenticated
  using (is_published = true);

revoke all on public.editor_templates from anon, authenticated;
grant select on public.editor_templates to anon, authenticated;
grant all on public.editor_templates to service_role;

comment on table public.editor_templates is
  'Versioned editor templates. Admin writes happen only through the admin-dashboard Edge Function; users can only read published rows.';
