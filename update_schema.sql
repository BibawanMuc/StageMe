
-- Add photo_url column if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'pAIntBoard' and column_name = 'photo_url') then
    alter table public."pAIntBoard" add column photo_url text;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'pAIntBoard' and column_name = 'stage') then
    alter table public."pAIntBoard" add column stage text;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'pAIntBoard' and column_name = 'prompts_used') then
    alter table public."pAIntBoard" add column prompts_used jsonb;
  end if;
end $$;
