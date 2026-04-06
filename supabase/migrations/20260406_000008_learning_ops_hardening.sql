create table if not exists public.student_skill_mastery (
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  attempts integer not null default 0,
  correct_attempts integer not null default 0,
  first_try_correct_attempts integer not null default 0,
  remediation_count integer not null default 0,
  mastery_score numeric(5,2) not null default 50,
  confidence_score numeric(5,2) not null default 0,
  consecutive_correct integer not null default 0,
  consecutive_incorrect integer not null default 0,
  last_outcome text,
  last_session_id uuid references public.challenge_sessions(id) on delete set null,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (student_id, skill_id)
);

create index if not exists idx_student_skill_mastery_student
  on public.student_skill_mastery(student_id, updated_at desc);
create index if not exists idx_student_skill_mastery_skill
  on public.student_skill_mastery(skill_id, mastery_score asc);

create table if not exists public.intervention_resolution_feedback (
  id uuid primary key default gen_random_uuid(),
  intervention_id uuid not null references public.teacher_interventions(id) on delete cascade,
  teacher_id uuid not null references public.teacher_profiles(id) on delete cascade,
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  skill_code text,
  strategy_tag text,
  notes text,
  effectiveness_rating integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_intervention_resolution_feedback_intervention
  on public.intervention_resolution_feedback(intervention_id, created_at desc);
create index if not exists idx_intervention_resolution_feedback_student
  on public.intervention_resolution_feedback(student_id, created_at desc);

create or replace trigger trg_student_skill_mastery_updated
  before update on public.student_skill_mastery
  for each row execute function public.touch_updated_at();

insert into public.student_skill_mastery (
  student_id,
  skill_id,
  attempts,
  correct_attempts,
  first_try_correct_attempts,
  remediation_count,
  mastery_score,
  confidence_score,
  consecutive_correct,
  consecutive_incorrect,
  last_outcome,
  last_seen_at
)
select
  cs.student_id,
  sr.skill_id,
  count(*) as attempts,
  count(*) filter (where sr.correct) as correct_attempts,
  count(*) filter (where sr.correct and sr.first_try) as first_try_correct_attempts,
  count(*) filter (where sr.remediation_triggered) as remediation_count,
  round(
    100.0 * count(*) filter (where sr.correct) / nullif(count(*), 0),
    1
  ) as mastery_score,
  least(100, count(*) * 8)::numeric(5,2) as confidence_score,
  0 as consecutive_correct,
  0 as consecutive_incorrect,
  null::text as last_outcome,
  max(sr.created_at) as last_seen_at
from public.session_results sr
join public.challenge_sessions cs
  on cs.id = sr.session_id
where sr.skill_id is not null
group by cs.student_id, sr.skill_id
on conflict (student_id, skill_id) do nothing;

insert into public.student_notifications (
  student_id,
  guardian_id,
  type,
  title,
  description,
  value,
  read,
  created_at
)
select
  sn.student_id,
  gsl.guardian_id,
  sn.type,
  sn.title,
  sn.description,
  sn.value,
  sn.read,
  sn.created_at
from public.student_notifications sn
join public.guardian_student_links gsl
  on gsl.student_id = sn.student_id
where sn.guardian_id is null
  and not exists (
    select 1
    from public.student_notifications existing
    where existing.student_id = sn.student_id
      and existing.guardian_id = gsl.guardian_id
      and existing.type = sn.type
      and existing.title = sn.title
      and existing.description = sn.description
      and coalesce(existing.value, '') = coalesce(sn.value, '')
      and existing.created_at = sn.created_at
  );

delete from public.student_notifications sn
where sn.guardian_id is null
  and exists (
    select 1
    from public.guardian_student_links gsl
    where gsl.student_id = sn.student_id
  );
