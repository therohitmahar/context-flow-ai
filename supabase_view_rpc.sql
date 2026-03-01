-- Instructions:
-- Run this block in your Supabase SQL Editor to create the view increment RPC function.

create or replace function increment_view_count(template_id uuid)
returns void as $$
begin
  update public.shared_templates
  set views = views + 1
  where id = template_id;
end;
$$ language plpgsql security definer;
