create extension if not exists pgcrypto;

create type admin_role as enum ('admin');
create type time_off_status as enum ('scheduled', 'canceled');
create type appointment_status as enum ('pending', 'confirmed', 'canceled');
create type appointment_actor_type as enum ('patient', 'admin', 'system');
create type notification_type as enum ('confirmation', 'reminder', 'cancellation');
create type notification_channel as enum ('email');
create type notification_status as enum ('pending', 'sent', 'failed', 'skipped');

create table admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  display_name text not null,
  role admin_role not null default 'admin',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table doctors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  full_name text not null,
  specialty text not null,
  bio text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table work_schedules (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null,
  day_of_week integer not null,
  start_time time not null,
  end_time time not null,
  effective_from date not null,
  effective_to date,
  is_active boolean not null default true,
  created_by_admin_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table time_off (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text not null,
  status time_off_status not null default 'scheduled',
  created_by_admin_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,
  patient_id uuid not null,
  doctor_id uuid not null,
  appointment_date date not null,
  start_time time not null,
  end_time time not null,
  status appointment_status not null default 'pending',
  cancellation_reason text,
  confirmed_at timestamptz,
  canceled_at timestamptz,
  confirmed_by_admin_id uuid,
  canceled_by_admin_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index appointments_active_slot_idx on appointments (doctor_id, appointment_date, start_time)
where status in ('pending', 'confirmed');
create index appointments_doctor_date_idx on appointments (doctor_id, appointment_date);

create table appointment_audit_log (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null,
  actor_type appointment_actor_type not null,
  actor_id uuid,
  action text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

create table notification_events (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null,
  type notification_type not null,
  channel notification_channel not null default 'email',
  scheduled_for timestamptz not null,
  status notification_status not null default 'pending',
  provider_message_id text,
  failure_reason text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notification_events_status_schedule_idx on notification_events (status, scheduled_for);
