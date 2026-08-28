create index if not exists editor_templates_created_by_idx
  on public.editor_templates (created_by);

create index if not exists editor_templates_updated_by_idx
  on public.editor_templates (updated_by);
