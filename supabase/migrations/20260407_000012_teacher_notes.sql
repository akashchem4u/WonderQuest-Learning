-- Teacher notes: allows teachers to attach private notes to individual students
create table if not exists public.teacher_notes (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null references public.teacher_profiles(id) on delete cascade,
  student_id  uuid not null references public.student_profiles(id) on delete cascade,
  body        text not null check (char_length(body) between 1 and 500),
  created_at  timestamptz not null default now()
);

create index if not exists idx_teacher_notes_teacher_id
  on public.teacher_notes(teacher_id, created_at desc);

create index if not exists idx_teacher_notes_student_id
  on public.teacher_notes(student_id);
