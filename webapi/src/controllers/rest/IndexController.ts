import {
  convertTrackResponseToTracks,
  makeSpotifyRequestWithBackoff,
} from "@src/helpers/misc";
import { AuthMiddleware } from "@src/middlewares/AuthMiddleware";
import { CreatePlaylistRequest } from "@src/models/CreatePlaylistRequest";
import { Playlist } from "@src/models/Playlist";
import { Track } from "@src/models/Track";
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
  @Get("/")
  get() {
    return { message: "success" };
  }

  @Get("/sync")
  @Description("Syncs the user's Spotify library with the selected playlist")
  @AcceptMime("text/event-stream")
  @UseAuth(AuthMiddleware)
  async sync(
    @Context() ctx: Context,
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

    const { tracks, total } = await convertTrackResponseToTracks(
      firstSavedTracksRes
    );

    allTracks.push(...tracks);

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

    let tracksAdded = 0;
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

      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
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
      throw new BadRequest("Failed to create playlist: ", res);
    }

    const resJson = await res.json();

    const playlist: Playlist = deserialize(resJson, {
      type: Playlist,
    });

    playlist.spotify_url = resJson["external_urls"]?.spotify;

    return playlist;
  }
}
