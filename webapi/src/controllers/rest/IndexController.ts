import { AuthMiddleware } from "@src/middlewares/AuthMiddleware";
import { CreatePlaylistRequest } from "@src/models/CreatePlaylistRequest";
import { Playlist } from "@src/models/Playlist";
import {
  BodyParams,
  Context,
  Controller,
  HeaderParams,
  PathParams,
  QueryParams,
  UseAuth,
} from "@tsed/common";
import { BadRequest } from "@tsed/exceptions";
import { deserialize } from "@tsed/json-mapper";
import { Default, Description, Get, Post, Returns } from "@tsed/schema";
import fetch from "node-fetch";

@Controller("/")
export class IndexController {
  @Get("/")
  get() {
    return { message: "success" };
  }

  @Get("/sync")
  @Description("Syncs the user's Spotify library with the selected playlist")
  @UseAuth(AuthMiddleware)
  async getSavedTracks(
    @Context() ctx: Context,
    @QueryParams("playlist_id") playlistId: string
  ) {
    const token = ctx.get("token");

    const res = await fetch("https://api.spotify.com/v1/me/tracks?limit=500", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
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

    console.log(rawItems);
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
