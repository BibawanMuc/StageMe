-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create the table 'pAIntBoard'
create table if not exists public."pAIntBoard" (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    drawing_url text not null,       -- Path/URL to the original sketch in storage
    result_url text not null,        -- Path/URL to the generated image in storage
    photo_url text,                  -- [NEW] Path/URL to the user's uploaded photo/selfie
    prompts_used jsonb not null,     -- Store full prompt config/text as JSON
    stage text,                      -- [NEW] Selected Stage identifier
    sport text,                      -- [LEGACY] Optional: Track sport context
    season text                      -- [LEGACY] Optional: Track season context
);

-- Enable Row Level Security (RLS)
alter table public."pAIntBoard" enable row level security;

-- Create Policy: Allow Public Insert/Select (Adjust as needed for Auth)
-- For a Kiosk app without user login, we might allow public inserts.
create policy "Allow public inserts"
on public."pAIntBoard"
for insert
to public
with check (true);

create policy "Allow public read"
on public."pAIntBoard"
for select
to public
using (true);

-- 2. Create the Storage Bucket 'pAIntBoard'
-- We will use a single bucket and organize by folders: /sketches, /results, /photos
insert into storage.buckets (id, name, public)
values ('pAIntBoard', 'pAIntBoard', true)
on conflict (id) do nothing;

-- Storage Policies for 'pAIntBoard' bucket
-- Allow public access to read files
create policy "pAIntBoard_Public_Select"
on storage.objects for select
using ( bucket_id = 'pAIntBoard' );

-- Allow public access to upload files
create policy "pAIntBoard_Public_Insert"
on storage.objects for insert
with check ( bucket_id = 'pAIntBoard' );
