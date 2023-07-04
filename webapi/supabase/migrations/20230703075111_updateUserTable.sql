alter table "public"."Users" drop constraint "Users_id_key";

alter table "public"."Users" drop constraint "Users_pkey";

drop index if exists "public"."Users_id_key";

drop index if exists "public"."Users_pkey";

drop table "public"."Users";

create table "public"."users" (
    "id" text not null,
    "created_at" timestamp with time zone default now(),
    "display_name" text,
    "refresh_token" text
);


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";


