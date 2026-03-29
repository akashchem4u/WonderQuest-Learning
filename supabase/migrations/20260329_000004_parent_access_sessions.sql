-- PLAT-02 / PLAT-03: Extend access tables to support parent, teacher, and owner sessions.
--
-- access_sessions: add guardian_id, make student_id nullable, broaden access_type.
-- access_attempts: broaden access_type to cover all four roles.

-- 1. Drop existing access_type constraints.
alter table public.access_sessions
  drop constraint if exists access_sessions_access_type_check;

alter table public.access_attempts
  drop constraint if exists access_attempts_access_type_check;

-- 2. Extend access_sessions for guardian sessions.
alter table public.access_sessions
  alter column student_id drop not null;

alter table public.access_sessions
  add column if not exists guardian_id uuid
    references public.guardian_profiles(id) on delete cascade;

-- 3. Re-add broadened constraints.
alter table public.access_sessions
  add constraint access_sessions_access_type_check
    check (access_type in ('child', 'parent'));

alter table public.access_sessions
  add constraint access_sessions_identity_check
    check (
      (access_type = 'child' and student_id is not null and guardian_id is null)
      or
      (access_type = 'parent' and guardian_id is not null and student_id is null)
    );

-- access_attempts covers child, parent (per-user PIN) and teacher/owner (IP-only).
alter table public.access_attempts
  add constraint access_attempts_access_type_check
    check (access_type in ('child', 'parent', 'teacher', 'owner'));

-- 4. Indexes.
create index if not exists idx_access_sessions_guardian
on public.access_sessions(guardian_id, access_type, expires_at desc);
