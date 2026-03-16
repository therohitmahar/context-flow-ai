# Template Visibility Supabase Changes

Apply this SQL in Supabase so only published templates are readable by everyone, while private templates are only readable by their creator.

```sql
alter table public.shared_templates
  add column if not exists is_published boolean not null default true;

create index if not exists shared_templates_visibility_idx
  on public.shared_templates (is_published, creator_id, views desc);

alter table public.shared_templates enable row level security;

drop policy if exists "shared_templates_public_read" on public.shared_templates;
create policy "shared_templates_public_read"
on public.shared_templates
for select
to anon, authenticated
using (
  is_published = true
  or creator_id = auth.uid()
);

drop policy if exists "shared_templates_insert_own_or_public_anon" on public.shared_templates;
create policy "shared_templates_insert_own_or_public_anon"
on public.shared_templates
for insert
with check (
  (auth.uid() is not null and creator_id = auth.uid())
  or (auth.uid() is null and creator_id is null and is_published = true)
);

drop policy if exists "shared_templates_update_own" on public.shared_templates;
create policy "shared_templates_update_own"
on public.shared_templates
for update
to authenticated
using (
  creator_id = auth.uid()
)
with check (
  creator_id = auth.uid()
);

drop policy if exists "shared_templates_delete_own" on public.shared_templates;
create policy "shared_templates_delete_own"
on public.shared_templates
for delete
to authenticated
using (
  creator_id = auth.uid()
);
```

Notes:

- Existing rows will default to `is_published = true`.
- If you want all existing templates to become private first, run:

```sql
update public.shared_templates
set is_published = false
where creator_id is not null;
```

- The frontend now sends `is_published` when saving a template, and the dashboard filters to public templates plus the signed-in user's own templates.
