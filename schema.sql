create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  role text not null default 'user' check (role in ('user','admin')),
  is_online boolean not null default false,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.competitions (
  id uuid primary key default gen_random_uuid(),
  api_league_id integer unique,
  name text not null,
  country text,
  logo_url text,
  season integer,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  api_team_id integer unique,
  competition_id uuid references public.competitions(id) on delete set null,
  name text not null,
  short_name text,
  logo_url text,
  country text,
  venue text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  api_player_id integer unique,
  name text not null,
  first_name text,
  last_name text,
  photo_url text,
  nationality text,
  position text,
  team_api_id integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fixtures (
  id uuid primary key default gen_random_uuid(),
  api_fixture_id integer unique not null,
  competition_id uuid references public.competitions(id) on delete set null,
  home_team_api_id integer,
  away_team_api_id integer,
  kickoff_at timestamptz,
  status text,
  home_goals integer,
  away_goals integer,
  venue text,
  raw_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  image_url text,
  category text,
  published boolean not null default false,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  options jsonb not null,
  active boolean not null default true,
  closes_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  option_index integer not null check (option_index >= 0),
  created_at timestamptz not null default now(),
  unique(poll_id,user_id)
);

create table if not exists public.player_of_week (
  id uuid primary key default gen_random_uuid(),
  question text not null default 'Who is the Player of the Week?',
  active boolean not null default true,
  starts_at timestamptz not null default now(),
  closes_at timestamptz,
  winner_player_id integer,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.player_of_week_nominees (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.player_of_week(id) on delete cascade,
  player_id integer not null,
  player_name text not null,
  player_photo text,
  created_at timestamptz not null default now(),
  unique(poll_id,player_id)
);

create table if not exists public.player_of_week_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.player_of_week(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  player_id integer not null,
  created_at timestamptz not null default now(),
  unique(poll_id,user_id)
);

create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  fixture_id integer not null,
  home_goals integer not null check(home_goals >= 0),
  away_goals integer not null check(away_goals >= 0),
  points integer not null default 0,
  settled boolean not null default false,
  settled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id,fixture_id)
);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  icon_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  unique(user_id,badge_id)
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  options jsonb not null,
  correct_answer text not null,
  explanation text,
  published boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  answer text not null,
  correct boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key(conversation_id,user_id)
);

create table if not exists public.group_chats (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  fixture_id integer,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.group_chat_members (
  group_id uuid not null references public.group_chats(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key(group_id,user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  group_id uuid references public.group_chats(id) on delete cascade,
  from_user uuid not null references public.profiles(id) on delete cascade,
  to_user uuid references public.profiles(id) on delete cascade,
  body text not null check(length(trim(body)) > 0),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  check((to_user is not null and group_id is null) or (to_user is null and group_id is not null) or conversation_id is not null)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'general',
  title text not null,
  body text not null,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  thumbnail_url text,
  provider text,
  authorized boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

grant execute on function public.is_admin() to authenticated;

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

grant execute on function public.current_profile_role() to authenticated;

-- Security-definer membership helpers prevent recursive RLS policies on membership tables.
create or replace function public.is_group_member(p_group_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.group_chat_members
    where group_id=p_group_id and user_id=p_user_id
  );
$$;
grant execute on function public.is_group_member(uuid,uuid) to authenticated;

create or replace function public.is_conversation_member(p_conversation_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.conversation_members
    where conversation_id=p_conversation_id and user_id=p_user_id
  );
$$;
grant execute on function public.is_conversation_member(uuid,uuid) to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id,username,display_name)
  values(
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'username',''), split_part(new.email,'@',1) || '_' || substr(new.id::text,1,6)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1))
  )
  on conflict(id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.create_group_chat(p_name text,p_fixture_id integer default null)
returns public.group_chats
language plpgsql
security definer
set search_path = public
as $$
declare v_group public.group_chats;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if length(trim(coalesce(p_name,'')))=0 then raise exception 'Group name is required'; end if;
  insert into public.group_chats(name,fixture_id,created_by) values(trim(p_name),p_fixture_id,auth.uid()) returning * into v_group;
  insert into public.group_chat_members(group_id,user_id) values(v_group.id,auth.uid());
  return v_group;
end;
$$;
grant execute on function public.create_group_chat(text,integer) to authenticated;

create or replace function public.set_presence(p_online boolean)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles set is_online=p_online,last_seen_at=now(),updated_at=now() where id=auth.uid();
$$;
grant execute on function public.set_presence(boolean) to authenticated;

create or replace function public.cast_poll_vote(p_poll_id uuid,p_user_id uuid,p_option_index integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare option_count integer;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then raise exception 'Unauthorized'; end if;
  select jsonb_array_length(options) into option_count from public.polls where id=p_poll_id and active=true and (closes_at is null or closes_at>now());
  if option_count is null then raise exception 'Poll is closed or missing'; end if;
  if p_option_index < 0 or p_option_index >= option_count then raise exception 'Invalid option'; end if;
  insert into public.poll_votes(poll_id,user_id,option_index) values(p_poll_id,p_user_id,p_option_index)
  on conflict(poll_id,user_id) do update set option_index=excluded.option_index;
end;
$$;
grant execute on function public.cast_poll_vote(uuid,uuid,integer) to authenticated;


create or replace function public.get_poll_results(p_poll_id uuid)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object('option_index', option_index, 'votes', votes) order by option_index), '[]'::jsonb)
  from (
    select option_index, count(*)::integer as votes
    from public.poll_votes
    where poll_id=p_poll_id
    group by option_index
  ) x;
$$;
grant execute on function public.get_poll_results(uuid) to anon,authenticated;

create or replace function public.cast_player_of_week_vote(p_poll_id uuid,p_user_id uuid,p_player_id integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or auth.uid() <> p_user_id then raise exception 'Unauthorized'; end if;
  if not exists(select 1 from public.player_of_week where id=p_poll_id and active=true and (closes_at is null or closes_at>now())) then raise exception 'Voting is closed'; end if;
  if not exists(select 1 from public.player_of_week_nominees where poll_id=p_poll_id and player_id=p_player_id) then raise exception 'Invalid nominee'; end if;
  insert into public.player_of_week_votes(poll_id,user_id,player_id) values(p_poll_id,p_user_id,p_player_id)
  on conflict(poll_id,user_id) do update set player_id=excluded.player_id;
end;
$$;
grant execute on function public.cast_player_of_week_vote(uuid,uuid,integer) to authenticated;


create or replace function public.get_player_of_week_results(p_poll_id uuid)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object('player_id', player_id, 'votes', votes) order by votes desc, player_id), '[]'::jsonb)
  from (
    select player_id, count(*)::integer as votes
    from public.player_of_week_votes
    where poll_id=p_poll_id
    group by player_id
  ) x;
$$;
grant execute on function public.get_player_of_week_results(uuid) to anon,authenticated;

create or replace function public.answer_quiz(p_quiz_id uuid,p_answer text,p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare is_correct boolean;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then raise exception 'Unauthorized'; end if;
  select lower(trim(correct_answer))=lower(trim(p_answer)) into is_correct from public.quizzes where id=p_quiz_id and published=true;
  if is_correct is null then raise exception 'Quiz not found'; end if;
  insert into public.quiz_attempts(quiz_id,user_id,answer,correct) values(p_quiz_id,p_user_id,p_answer,is_correct);
  return is_correct;
end;
$$;
grant execute on function public.answer_quiz(uuid,text,uuid) to authenticated;

create or replace function public.settle_prediction(p_prediction_id uuid,p_home_goals integer,p_away_goals integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare predicted_h integer; predicted_a integer; score integer;
begin
  if not public.is_admin() then raise exception 'Unauthorized'; end if;
  select home_goals,away_goals into predicted_h,predicted_a from public.predictions where id=p_prediction_id;
  if predicted_h is null then raise exception 'Prediction not found'; end if;
  score := case when predicted_h=p_home_goals and predicted_a=p_away_goals then 3 when (predicted_h>predicted_a and p_home_goals>p_away_goals) or (predicted_h<predicted_a and p_home_goals<p_away_goals) or (predicted_h=predicted_a and p_home_goals=p_away_goals) then 1 else 0 end;
  update public.predictions set points=score,settled=true,settled_at=now(),updated_at=now() where id=p_prediction_id;
  return score;
end;
$$;
grant execute on function public.settle_prediction(uuid,integer,integer) to authenticated;

create or replace function public.award_badge(p_user_id uuid,p_badge_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare bid uuid;
begin
  if not public.is_admin() then raise exception 'Unauthorized'; end if;
  select id into bid from public.badges where code=p_badge_code;
  if bid is null then raise exception 'Badge not found'; end if;
  insert into public.user_badges(user_id,badge_id) values(p_user_id,bid) on conflict do nothing;
end;
$$;
grant execute on function public.award_badge(uuid,text) to authenticated;

-- Seed standard badges. Admins can add more later.
insert into public.badges(code,name,description) values
('first_vote','First Vote','Cast your first community vote.'),
('quiz_starter','Quiz Starter','Complete your first football quiz attempt.'),
('predictor','Predictor','Submit your first match prediction.'),
('community','Community Member','Join the Football World 360 community.')
on conflict(code) do nothing;

-- Indexes used by the application.
create index if not exists idx_news_published_created on public.news(published,created_at desc);
create index if not exists idx_polls_active_created on public.polls(active,created_at desc);
create index if not exists idx_fixtures_api_id on public.fixtures(api_fixture_id);
create index if not exists idx_predictions_user_created on public.predictions(user_id,created_at desc);
create index if not exists idx_messages_pair_created on public.messages(from_user,to_user,created_at);
create index if not exists idx_messages_group_created on public.messages(group_id,created_at);
create index if not exists idx_notifications_user_created on public.notifications(user_id,created_at desc);

-- RLS
alter table public.profiles enable row level security;
alter table public.competitions enable row level security;
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.fixtures enable row level security;
alter table public.news enable row level security;
alter table public.polls enable row level security;
alter table public.poll_votes enable row level security;
alter table public.player_of_week enable row level security;
alter table public.player_of_week_nominees enable row level security;
alter table public.player_of_week_votes enable row level security;
alter table public.predictions enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.group_chats enable row level security;
alter table public.group_chat_members enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.media enable row level security;
alter table public.admin_audit_logs enable row level security;

-- Drop/recreate policies so rerunning this file is safe.
do $$ declare r record; begin
  for r in select schemaname,tablename,policyname from pg_policies where schemaname='public' and tablename in ('profiles','competitions','teams','players','fixtures','news','polls','poll_votes','player_of_week','player_of_week_nominees','player_of_week_votes','predictions','badges','user_badges','quizzes','quiz_attempts','conversations','conversation_members','group_chats','group_chat_members','messages','notifications','media','admin_audit_logs') loop
    execute format('drop policy if exists %I on %I.%I',r.policyname,r.schemaname,r.tablename);
  end loop;
end $$;

create policy profiles_read on public.profiles for select to authenticated using(true);
create policy profiles_self_update on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid() and role=public.current_profile_role());
create policy profiles_admin on public.profiles for all to authenticated using(public.is_admin()) with check(public.is_admin());

create policy competitions_read on public.competitions for select using(active=true or public.is_admin());
create policy competitions_admin on public.competitions for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy teams_read on public.teams for select using(true);
create policy teams_admin on public.teams for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy players_read on public.players for select using(true);
create policy players_admin on public.players for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy fixtures_read on public.fixtures for select using(true);
create policy fixtures_admin on public.fixtures for all to authenticated using(public.is_admin()) with check(public.is_admin());

create policy news_read on public.news for select using(published=true or public.is_admin());
create policy news_admin on public.news for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy polls_read on public.polls for select using(active=true or public.is_admin());
create policy polls_admin on public.polls for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy poll_votes_self on public.poll_votes for select to authenticated using(user_id=auth.uid());

create policy pow_read on public.player_of_week for select using(active=true or public.is_admin());
create policy pow_admin on public.player_of_week for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy pow_nominees_read on public.player_of_week_nominees for select using(true);
create policy pow_nominees_admin on public.player_of_week_nominees for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy pow_votes_self on public.player_of_week_votes for select to authenticated using(user_id=auth.uid());

create policy predictions_self on public.predictions for all to authenticated using(user_id=auth.uid() or public.is_admin()) with check(user_id=auth.uid() or public.is_admin());
create policy badges_read on public.badges for select using(true);
create policy badges_admin on public.badges for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy user_badges_read on public.user_badges for select using(true);
create policy user_badges_admin on public.user_badges for all to authenticated using(public.is_admin()) with check(public.is_admin());

create policy quizzes_read on public.quizzes for select using(published=true or public.is_admin());
create policy quizzes_admin on public.quizzes for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy quiz_attempts_self on public.quiz_attempts for select to authenticated using(user_id=auth.uid());

create policy conversations_member_read on public.conversations for select to authenticated using(public.is_conversation_member(id,auth.uid()));
create policy conversation_members_read on public.conversation_members for select to authenticated using(user_id=auth.uid() or public.is_conversation_member(conversation_id,auth.uid()));
create policy conversation_create on public.conversations for insert to authenticated with check(true);
create policy conversation_member_create on public.conversation_members for insert to authenticated with check(user_id=auth.uid());

create policy groups_read_member on public.group_chats for select to authenticated using(public.is_group_member(id,auth.uid()));
create policy groups_create on public.group_chats for insert to authenticated with check(created_by=auth.uid());
create policy groups_admin on public.group_chats for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy group_members_read on public.group_chat_members for select to authenticated using(user_id=auth.uid() or public.is_group_member(group_id,auth.uid()));
create policy group_members_join on public.group_chat_members for insert to authenticated with check(user_id=auth.uid());
create policy group_members_admin on public.group_chat_members for all to authenticated using(public.is_admin()) with check(public.is_admin());

create policy messages_participant on public.messages for select to authenticated using(from_user=auth.uid() or to_user=auth.uid() or public.is_group_member(messages.group_id,auth.uid()));
create policy messages_insert on public.messages for insert to authenticated with check(from_user=auth.uid() and ((to_user is not null) or public.is_group_member(messages.group_id,auth.uid())));
create policy messages_read on public.messages for update to authenticated using(to_user=auth.uid()) with check(to_user=auth.uid());

create policy notifications_self on public.notifications for select to authenticated using(user_id=auth.uid());
create policy notifications_update on public.notifications for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy notifications_admin_insert on public.notifications for insert to authenticated with check(public.is_admin());

create policy media_read on public.media for select using(authorized=true or public.is_admin());
create policy media_admin on public.media for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy audit_admin_read on public.admin_audit_logs for select to authenticated using(public.is_admin());
create policy audit_admin_insert on public.admin_audit_logs for insert to authenticated with check(public.is_admin() and admin_id=auth.uid());

-- Realtime publication: safe to add only when publication exists in Supabase.
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null;
when undefined_object then null;
end $$;
