-- Secure app helpers used by the React client.
-- Run after 001_initial_private_museum.sql.

alter table public.memories
  add column if not exists memory_type text not null default '日常',
  add column if not exists achievement text;

drop policy if exists "owners can add members" on public.museum_members;
drop policy if exists "owners can manage invites" on public.museum_invites;

create policy "owners can read invites"
on public.museum_invites for select
using (public.is_museum_owner(museum_id));

create policy "owners can delete invites"
on public.museum_invites for delete
using (public.is_museum_owner(museum_id));

create or replace function public.create_museum_with_owner(museum_name text default '我们的时间博物馆')
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_museum_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  insert into public.museums (name, owner_id)
  values (coalesce(nullif(museum_name, ''), '我们的时间博物馆'), auth.uid())
  returning id into new_museum_id;

  insert into public.museum_members (museum_id, user_id, role, display_name)
  values (new_museum_id, auth.uid(), 'owner', '我');

  return new_museum_id;
end;
$$;

create or replace function public.create_museum_invite(target_museum_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  member_count integer;
  invite_token text;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  if not public.is_museum_owner(target_museum_id) then
    raise exception 'not_owner';
  end if;

  select count(*) into member_count
  from public.museum_members
  where museum_id = target_museum_id;

  if member_count >= 2 then
    raise exception 'museum_full';
  end if;

  update public.museum_invites
  set used_at = now()
  where museum_id = target_museum_id and used_at is null;

  invite_token := encode(gen_random_bytes(24), 'hex');

  insert into public.museum_invites (
    museum_id,
    token_hash,
    created_by,
    expires_at
  )
  values (
    target_museum_id,
    encode(digest(invite_token, 'sha256'), 'hex'),
    auth.uid(),
    now() + interval '7 days'
  );

  return invite_token;
end;
$$;

create or replace function public.join_museum_invite(invite_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_record public.museum_invites%rowtype;
  member_count integer;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  select *
  into invite_record
  from public.museum_invites
  where token_hash = encode(digest(invite_token, 'sha256'), 'hex')
    and used_at is null
    and expires_at > now()
  limit 1
  for update;

  if invite_record.id is null then
    raise exception 'invalid_invite';
  end if;

  select count(*) into member_count
  from public.museum_members
  where museum_id = invite_record.museum_id;

  if member_count >= 2 then
    raise exception 'museum_full';
  end if;

  insert into public.museum_members (museum_id, user_id, role, display_name)
  values (invite_record.museum_id, auth.uid(), 'member', '她')
  on conflict (museum_id, user_id) do nothing;

  update public.museum_invites
  set used_at = now()
  where id = invite_record.id;

  return invite_record.museum_id;
end;
$$;

grant execute on function public.create_museum_with_owner(text) to authenticated;
grant execute on function public.create_museum_invite(uuid) to authenticated;
grant execute on function public.join_museum_invite(text) to authenticated;
