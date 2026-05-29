-- Initial schema for a private two-person Time Museum.
-- Run this in Supabase SQL editor after creating the project.

create extension if not exists pgcrypto;

create table if not exists public.museums (
  id uuid primary key default gen_random_uuid(),
  name text not null default '我们的时间博物馆',
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.museum_members (
  id uuid primary key default gen_random_uuid(),
  museum_id uuid not null references public.museums(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  display_name text,
  joined_at timestamptz not null default now(),
  unique (museum_id, user_id)
);

create table if not exists public.museum_invites (
  id uuid primary key default gen_random_uuid(),
  museum_id uuid not null references public.museums(id) on delete cascade,
  token_hash text not null unique,
  created_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  museum_id uuid not null references public.museums(id) on delete cascade,
  title text not null,
  memory_date date,
  description text,
  author_id uuid not null references auth.users(id) on delete cascade,
  location text,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memory_photos (
  id uuid primary key default gen_random_uuid(),
  museum_id uuid not null references public.museums(id) on delete cascade,
  memory_id uuid not null references public.memories(id) on delete cascade,
  storage_path text not null,
  caption text,
  uploaded_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  museum_id uuid not null references public.museums(id) on delete cascade,
  memory_id uuid not null references public.memories(id) on delete cascade,
  content text not null,
  author_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  museum_id uuid not null references public.museums(id) on delete cascade,
  memory_id uuid not null references public.memories(id) on delete cascade,
  emoji text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (memory_id, emoji, user_id)
);

create table if not exists public.letters (
  id uuid primary key default gen_random_uuid(),
  museum_id uuid not null references public.museums(id) on delete cascade,
  title text not null,
  content text not null,
  unlock_at timestamptz,
  author_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  museum_id uuid not null references public.museums(id) on delete cascade,
  title text not null,
  milestone_date date,
  description text,
  icon text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.anniversaries (
  id uuid primary key default gen_random_uuid(),
  museum_id uuid not null references public.museums(id) on delete cascade,
  title text not null,
  date date not null,
  repeat_yearly boolean not null default true,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_museum_member(target_museum_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.museum_members
    where museum_id = target_museum_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_museum_owner(target_museum_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.museum_members
    where museum_id = target_museum_id
      and user_id = auth.uid()
      and role = 'owner'
  );
$$;

alter table public.museums enable row level security;
alter table public.museum_members enable row level security;
alter table public.museum_invites enable row level security;
alter table public.memories enable row level security;
alter table public.memory_photos enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;
alter table public.letters enable row level security;
alter table public.milestones enable row level security;
alter table public.anniversaries enable row level security;

create policy "members can read museums"
on public.museums for select
using (public.is_museum_member(id));

create policy "authenticated users can create owned museums"
on public.museums for insert
with check (auth.uid() = owner_id);

create policy "owners can update museums"
on public.museums for update
using (public.is_museum_owner(id))
with check (public.is_museum_owner(id));

create policy "members can read members"
on public.museum_members for select
using (public.is_museum_member(museum_id));

create policy "owners can add members"
on public.museum_members for insert
with check (public.is_museum_owner(museum_id) or user_id = auth.uid());

create policy "owners can update members"
on public.museum_members for update
using (public.is_museum_owner(museum_id))
with check (public.is_museum_owner(museum_id));

create policy "owners can delete members"
on public.museum_members for delete
using (public.is_museum_owner(museum_id));

create policy "owners can manage invites"
on public.museum_invites for all
using (public.is_museum_owner(museum_id))
with check (public.is_museum_owner(museum_id));

create policy "members can read memories"
on public.memories for select
using (public.is_museum_member(museum_id));

create policy "members can create memories"
on public.memories for insert
with check (public.is_museum_member(museum_id) and author_id = auth.uid());

create policy "authors and owners can update memories"
on public.memories for update
using (author_id = auth.uid() or public.is_museum_owner(museum_id))
with check (public.is_museum_member(museum_id));

create policy "authors and owners can delete memories"
on public.memories for delete
using (author_id = auth.uid() or public.is_museum_owner(museum_id));

create policy "members can access memory photos"
on public.memory_photos for select
using (public.is_museum_member(museum_id));

create policy "members can create memory photos"
on public.memory_photos for insert
with check (public.is_museum_member(museum_id) and uploaded_by = auth.uid());

create policy "uploaders and owners can delete memory photos"
on public.memory_photos for delete
using (uploaded_by = auth.uid() or public.is_museum_owner(museum_id));

create policy "members can read comments"
on public.comments for select
using (public.is_museum_member(museum_id));

create policy "members can create comments"
on public.comments for insert
with check (public.is_museum_member(museum_id) and author_id = auth.uid());

create policy "authors and owners can update comments"
on public.comments for update
using (author_id = auth.uid() or public.is_museum_owner(museum_id))
with check (public.is_museum_member(museum_id));

create policy "authors and owners can delete comments"
on public.comments for delete
using (author_id = auth.uid() or public.is_museum_owner(museum_id));

create policy "members can read reactions"
on public.reactions for select
using (public.is_museum_member(museum_id));

create policy "members can create reactions"
on public.reactions for insert
with check (public.is_museum_member(museum_id) and user_id = auth.uid());

create policy "users can delete own reactions"
on public.reactions for delete
using (user_id = auth.uid());

create policy "members can read unlocked letters"
on public.letters for select
using (
  public.is_museum_member(museum_id)
  and (unlock_at is null or unlock_at <= now() or author_id = auth.uid())
);

create policy "members can create letters"
on public.letters for insert
with check (public.is_museum_member(museum_id) and author_id = auth.uid());

create policy "authors and owners can update letters"
on public.letters for update
using (author_id = auth.uid() or public.is_museum_owner(museum_id))
with check (public.is_museum_member(museum_id));

create policy "authors and owners can delete letters"
on public.letters for delete
using (author_id = auth.uid() or public.is_museum_owner(museum_id));

create policy "members can read milestones"
on public.milestones for select
using (public.is_museum_member(museum_id));

create policy "members can manage milestones"
on public.milestones for all
using (public.is_museum_member(museum_id))
with check (public.is_museum_member(museum_id));

create policy "members can read anniversaries"
on public.anniversaries for select
using (public.is_museum_member(museum_id));

create policy "members can manage anniversaries"
on public.anniversaries for all
using (public.is_museum_member(museum_id))
with check (public.is_museum_member(museum_id));

insert into storage.buckets (id, name, public)
values ('museum-photos', 'museum-photos', false)
on conflict (id) do nothing;

create policy "members can upload private museum photos"
on storage.objects for insert
with check (
  bucket_id = 'museum-photos'
  and public.is_museum_member((storage.foldername(name))[1]::uuid)
);

create policy "members can read private museum photos"
on storage.objects for select
using (
  bucket_id = 'museum-photos'
  and public.is_museum_member((storage.foldername(name))[1]::uuid)
);

create policy "members can delete own museum photos"
on storage.objects for delete
using (
  bucket_id = 'museum-photos'
  and public.is_museum_member((storage.foldername(name))[1]::uuid)
  and owner = auth.uid()
);
