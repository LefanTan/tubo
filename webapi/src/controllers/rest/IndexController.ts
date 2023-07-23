import {
  convertTrackResponseToTracks,
  getRefreshToken,
  makeSpotifyRequestWithBackoff,
} from "@src/helpers/misc";
import { AuthMiddleware } from "@src/middlewares/AuthMiddleware";
import { CreatePlaylistRequest } from "@src/models/CreatePlaylistRequest";
import { Playlist } from "@src/models/Playlist";
import { Track } from "@src/models/Track";
import { SupabaseService } from "@src/services";
import {
  BodyParams,
  Context,
  Controller,
  PathParams,
  QueryParams,
  UseAuth,
} from "@tsed/common";
import { BadRequest } from "@tsed/exceptions";
import { deserialize } from "@tsed/json-mapper";
import {
  AcceptMime,
  Default,
  Description,
  Get,
  Post,
  Returns,
} from "@tsed/schema";
import { Response } from "express";
import fetch from "node-fetch";

@Controller("/")
export class IndexController {
  constructor(private readonly supabaseService: SupabaseService) {
    //
  }

  @Get("/")
  get() {
    return { message: "success" };
  }

  @Post("/batch-sync-playlist")
  @Description(
    "Represents a job that batch syncs a maximum 50 users' playlists that exceeded a certain threshold"
  )
  @UseAuth(AuthMiddleware)
  async batchSyncPlaylist(@Context() ctx: Context) {
    const token = ctx.get("token");
    if (token !== "tubo-internal") {
      throw new BadRequest("Unauthorized: Incorrect token provided");
    }

    const days = 3;
    const threshold = days * 24 * 60 * 60 * 1000; // 4 days in ms

    const { data: syncedPlaylists, error } = await this.supabaseService.supabase
      .from("synced_playlists")
      .select("*, users(display_name, refresh_token)")
      .limit(50)
      .order("updated_at", { ascending: false });

    if (error) {
      throw new BadRequest("Failed to get synced_playlists: ", error);
    }

    const jobs = await Promise.allSettled(
      syncedPlaylists.map(async (playlistJob) => {
        // NOTE: Supabase returns users as object, not array....
        const user = playlistJob.users as any;

        const lastSyncedAt = new Date(playlistJob.updated_at!).getTime();
        const now = new Date().getTime();

        if (now - lastSyncedAt <= threshold) {
          throw new Error(
            `Not updating playlist: ${playlistJob.playlist_id} as it was last updated in less than ${days} days ago`
          );
        }

        const refreshToken = user?.refresh_token;

        if (!refreshToken) {
          throw new Error(
            "No refresh token found for user: " + user?.display_name
          );
        }

        // Grab access token for user
        const accessToken = await getRefreshToken(refreshToken);

        // Get existing playlist items.
        const existingPlaylistItemTotalRes =
          await makeSpotifyRequestWithBackoff(
            `https://api.spotify.com/v1/playlists/${playlistJob.playlist_id}/tracks?fields=total`,
            {
              method: "GET",
              headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json",
              },
            }
          ).then((res) => res.json());

        const existingPlaylistItemTotal =
          existingPlaylistItemTotalRes["total"] ?? 0;

        let offset = 0;

        //

        const firstSavedTracksRes = await makeSpotifyRequestWithBackoff(
          `https://api.spotify.com/v1/me/tracks?limit=50&offset=${offset++}`,
          {
            headers: {
              Authorization: "Bearer " + accessToken,
            },
          }
        );

        const allTracks: Track[] = [];

        const { tracks: firstTracks, total } =
          await convertTrackResponseToTracks(firstSavedTracksRes);

        allTracks.push(...firstTracks);

        // Keep requesting tracks until we have all of them
        while (allTracks.length < total) {
          const results = await makeSpotifyRequestWithBackoff(
            `https://api.spotify.com/v1/me/tracks?limit=50&offset=${
              offset * 50
            }`,
            {
              headers: {
                Authorization: "Bearer " + accessToken,
              },
            }
          );

          const { tracks } = await convertTrackResponseToTracks(results);

          allTracks.push(...tracks);
          offset++;

          // wait 50ms to avoid rate limiting
          await new Promise((resolve) => {
            setTimeout(resolve, 50);
          });
        }

        allTracks.sort((a, b) => {
          return (
            new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
          );
        });

        let tracksAdded = 0;

        if (existingPlaylistItemTotal > 0) {
          // Add 100 tracks at a time
          const tracksToAdd = allTracks.slice(
            tracksAdded,
            Math.min(existingPlaylistItemTotal, tracksAdded + 100)
          );

          try {
            await makeSpotifyRequestWithBackoff(
              `https://api.spotify.com/v1/playlists/${playlistJob.playlist_id}/tracks`,
              {
                method: "PUT",
                headers: {
                  Authorization: "Bearer " + accessToken,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  uris: tracksToAdd.map((track) => track.uri),
                }),
              }
            );

            tracksAdded += tracksToAdd.length;
          } catch (err) {
            throw new BadRequest("Failed to replace tracks: ", err);
          }
        }

        // Push all remaining liked tracks to the playlist
        while (tracksAdded < allTracks.length) {
          // Add 100 tracks at a time
          const tracksToAdd = allTracks.slice(tracksAdded, tracksAdded + 100);

          try {
            await makeSpotifyRequestWithBackoff(
              `https://api.spotify.com/v1/playlists/${playlistJob.playlist_id}/tracks`,
              {
                method: "POST",
                headers: {
                  Authorization: "Bearer " + accessToken,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  position: tracksAdded,
                  uris: tracksToAdd.map((track) => track.uri),
                }),
              }
            );

            tracksAdded += tracksToAdd.length;
          } catch (err) {
            throw new BadRequest("Failed to add tracks: ", err);
          }
        }

        await this.supabaseService.supabase
          .from("synced_playlists")
          .update({
            playlist_id: playlistJob.playlist_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", playlistJob.id);

        return playlistJob;
      })
    );

    return jobs.map((job) => {
      if (job.status === "fulfilled") {
        return { playlist: job.value };
      } else {
        return { reason: job.reason?.message };
      }
    });
  }

  @Get("/:user_id/sync")
  @Description("Syncs the user's Spotify library with the selected playlist")
  @AcceptMime("text/event-stream")
  @UseAuth(AuthMiddleware)
  async sync(
    @Context() ctx: Context,
    @PathParams("user_id") userId: string,
    @QueryParams("playlist_id") playlistId: string
  ) {
    const token = ctx.get("token");
    const res: Response = ctx.response.raw;
    let offset = 0;

    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Content-Encoding", "none");
    res.flushHeaders();

    const firstSavedTracksRes = await makeSpotifyRequestWithBackoff(
      `https://api.spotify.com/v1/me/tracks?limit=50&offset=${offset++}`,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    const allTracks: Track[] = [];

    const { tracks: firstTracks, total } = await convertTrackResponseToTracks(
      firstSavedTracksRes
    );

    allTracks.push(...firstTracks);

    // Total progress is the number of requests we need to make to get all the tracks
    const totalProgress = Math.ceil(total / 50) + Math.ceil(total / 100) - 1;
    // Progress index is the number of requests we've made so far
    let progressIndex = 0;

    res.write("event: total\n");
    res.write(`data: ${totalProgress}\n\n`);

    res.write("event: progress\n");
    res.write(`data: ${progressIndex}\n\n`);

    res.write("event: tracks-pulled\n");
    res.write(`data: ${allTracks.length}\n\n`);

    // Keep requesting tracks until we have all of them
    while (allTracks.length < total) {
      const results = await makeSpotifyRequestWithBackoff(
        `https://api.spotify.com/v1/me/tracks?limit=50&offset=${offset * 50}`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const { tracks } = await convertTrackResponseToTracks(results);

      allTracks.push(...tracks);

      res.write("event: tracks-pulled\n");
      res.write(`data: ${allTracks.length}\n\n`);

      offset++;

      res.write("event: progress\n");
      res.write(`data: ${++progressIndex}\n\n`);

      // wait 50ms to avoid rate limiting
      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });
    }

    allTracks.sort((a, b) => {
      return new Date(b.added_at).getTime() - new Date(a.added_at).getTime();
    });

    // Get existing playlist items
    const existingPlaylistItemTotalRes = await makeSpotifyRequestWithBackoff(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?fields=total`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      }
    ).then((res) => res.json());

    const existingPlaylistItemTotal =
      existingPlaylistItemTotalRes["total"] ?? 0;

    let tracksAdded = 0;

    if (existingPlaylistItemTotal > 0) {
      // Add 100 tracks at a time
      const tracksToAdd = allTracks.slice(
        tracksAdded,
        Math.min(existingPlaylistItemTotal, tracksAdded + 100)
      );

      try {
        await makeSpotifyRequestWithBackoff(
          `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
          {
            method: "PUT",
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              uris: tracksToAdd.map((track) => track.uri),
            }),
          }
        );

        tracksAdded += tracksToAdd.length;

        res.write("event: tracks-added\n");
        res.write(`data: ${tracksAdded}\n\n`);

        res.write("event: progress\n");
        res.write(`data: ${++progressIndex}\n\n`);
      } catch (err) {
        throw new BadRequest("Failed to replace tracks: ", err);
      }
    }

    // Push all remaining liked tracks to the playlist
    while (tracksAdded < allTracks.length) {
      // Add 100 tracks at a time
      const tracksToAdd = allTracks.slice(tracksAdded, tracksAdded + 100);

      try {
        await makeSpotifyRequestWithBackoff(
          `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
          {
            method: "POST",
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              position: tracksAdded,
              uris: tracksToAdd.map((track) => track.uri),
            }),
          }
        );

        tracksAdded += tracksToAdd.length;

        res.write("event: tracks-added\n");
        res.write(`data: ${tracksAdded}\n\n`);

        res.write("event: progress\n");
        res.write(`data: ${++progressIndex}\n\n`);
      } catch (err) {
        throw new BadRequest("Failed to add tracks: ", err);
      }
    }

    // Need to use upsert here because there is an odd bug where if the table is empty, the following query hangs
    const { data } = await this.supabaseService.supabase
      .from("synced_playlists")
      .upsert(
        {
          user_id: userId,
          playlist_id: playlistId,
        },
        { onConflict: "user_id" }
      )
      .select("id");

    // Update existing sync entry if exist
    if (data?.[0].id) {
      await this.supabaseService.supabase
        .from("synced_playlists")
        .update({
          playlist_id: playlistId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data?.[0].id);
    } else {
      await this.supabaseService.supabase
        .from("synced_playlists")
        .insert([
          {
            user_id: userId,
            playlist_id: playlistId,
          },
        ])
        .select("*");
    }

    res.end();
  }

  @Get("/:user_id/playlist")
  @Returns(200, Array).Of(Playlist)
  @UseAuth(AuthMiddleware)
  async getPlaylist(
    @Context() ctx: Context,
    @PathParams("user_id") userId: string,
    @QueryParams("limit") @Default(50) limit: number,
    @QueryParams("offset") @Default(0) offset: number
  ) {
    const token = ctx.get("token");

    const res = await fetch(
      `https://api.spotify.com/v1/users/${userId}/playlists?limit=${limit}&offset=${
        offset ?? 0
      }`,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    if (!res.ok) {
      throw new BadRequest("Failed to get playlist: ", res);
    }

    const rawItems = (await res.json())["items"];
    const playlists = rawItems.map((item: any) => {
      const playlist = item as Playlist;

      playlist.spotify_url = item["external_urls"]?.spotify;

      return playlist;
    });

    return playlists;
  }

  @Post("/:user_id/playlist/create")
  @Returns(200, Playlist)
  @UseAuth(AuthMiddleware)
  async createPlaylist(
    @Context() ctx: Context,
    @PathParams("user_id") userId: string,
    @BodyParams("createPlaylistRequest")
    createPlaylistRequest: CreatePlaylistRequest
  ) {
    const token = ctx.get("token");

    const res = await fetch(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        method: "POST",
        body: JSON.stringify({
          name: createPlaylistRequest.name,
          description: createPlaylistRequest.description,
          public: createPlaylistRequest.public,
        }),
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    if (!res.ok) {
      throw new BadRequest("Failed to create playlist");
    }

    const resJson = await res.json();

    const playlist: Playlist = deserialize(resJson, {
      type: Playlist,
    });

    playlist.spotify_url = resJson["external_urls"]?.spotify;

    return playlist;
  }
}
