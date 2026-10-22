alter table public.pentests
  add column engine text not null default 'light',
  add column report text,
  add column error text,
  add column authorized_at timestamptz,
  add column started_at timestamptz,
  add column finished_at timestamptz;

alter table public.findings add column source text not null default 'light';

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
  return new;
end $$;