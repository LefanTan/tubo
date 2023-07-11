alter table "public"."synced_playlists" drop constraint "synced_playlist_user_id_key";

drop index if exists "public"."synced_playlist_user_id_key";

alter table "public"."synced_playlists" alter column "user_id" set not null;

CREATE UNIQUE INDEX synced_playlists_user_id_key ON public.synced_playlists USING btree (user_id);

alter table "public"."synced_playlists" add constraint "synced_playlists_user_id_key" UNIQUE using index "synced_playlists_user_id_key";


