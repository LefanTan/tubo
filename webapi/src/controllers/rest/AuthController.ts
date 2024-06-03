import { isProduction } from "@src/config/envs";
import { generateRandomString, getRefreshToken } from "@src/helpers/misc";
import { AuthMiddleware } from "@src/middlewares";
import { ProfileResponse } from "@src/models/ProfileResponse";
import { SpotifyUser } from "@src/models/User";
import { SupabaseService } from "@src/services";
import { Controller } from "@tsed/di";
import { BadRequest, Unauthorized } from "@tsed/exceptions";
import { UseAuth } from "@tsed/platform-middlewares";
import { BodyParams, Context, QueryParams } from "@tsed/platform-params";
import { Description, Get, Name, Post, Returns } from "@tsed/schema";

import fetch from "node-fetch";
import querystring from "node:querystring";

@Controller("/auth")
@Name("AuthController")
export class AuthController {
  stateCompare: Set<string> = new Set();
  redirectUrl = isProduction
    ? "https://tubo-webapi-9ba99/rest/auth/redirect"
    : "http://localhost:8087/rest/auth/redirect";

  appUrl = isProduction
    ? "https://tubo-ca974.web.app/app"
    : "http://localhost:5173/app";

  constructor(private readonly supabaseService: SupabaseService) {
    //
  }

  @Get("/login")
  async login(@Context() ctx: Context) {
    // TODO: Different depending on Env

    // Protect agains CSRF
    const state = generateRandomString(16);
    const scope =
      "user-library-read user-read-email playlist-modify-public playlist-modify-private";

    this.stateCompare.add(state);

    ctx.response.redirect(
      302,
      "https://accounts.spotify.com/authorize?" +
        querystring.stringify({
          response_type: "code",
          client_id: process.env.SPOTIFY_CLIENT_ID,
          scope: scope,
          redirect_uri: this.redirectUrl,
          state: state,
        })
    );
  }

  @Get("/redirect")
  async redirect(
    @Context() ctx: Context,
    @QueryParams("code") code: string,
    @QueryParams("state") state: string,
    @QueryParams("error") error: string
  ) {
    if (error) {
      throw new Unauthorized(error);
    }

    if (!this.stateCompare.has(state)) {
      throw new Unauthorized("State mismatch");
    }

    const form = new URLSearchParams();
    form.append("code", code);
    form.append("grant_type", "authorization_code");
    // Used as validation only
    form.append("redirect_uri", this.redirectUrl);

    const res = await fetch("https://accounts.spotify.com/api/token", {
      body: form,
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.SPOTIFY_CLIENT_ID +
              ":" +
              process.env.SPOTIFY_CLIENT_SECRET
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    const json = await res.json();

    ctx.response.cookie("access_token", json["access_token"], {
      secure: true,
      sameSite: "none",
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      domain: isProduction ? "tubo-ca974.web.app" : "localhost",
    });

    // Store/Update refresh token in Supabase
    const refreshToken = json["refresh_token"];

    // Get User's Spotify profile
    const userRes = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: "Bearer " + json["access_token"],
      },
    }).then((res) => res.json() as Promise<SpotifyUser>);

    // Check if user exists in Supabase, if not, create it
    await this.supabaseService.supabase
      .from("users")
      .upsert({
        id: userRes["id"],
        display_name: userRes["display_name"],
        refresh_token: refreshToken,
        email: userRes["email"],
      })
      .select();

    ctx.response.cookie("user_id", userRes["id"], {
      secure: true,
      sameSite: "none",
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      domain: isProduction ? "tubo-ca974.web.app" : "localhost",
    });

    return ctx.response.redirect(302, this.appUrl);
  }

  @Post("/profile")
  @Description(
    "Grab the user's Spotify and Tubo profile. Refreshes access token if needed."
  )
  @Returns(200, ProfileResponse)
  @UseAuth(AuthMiddleware)
  async profile(
    @Context() ctx: Context,
    @BodyParams("userId") userId: string
  ): Promise<ProfileResponse> {
    const token = ctx.get("token");

    let [spotifyRes, tuboUserRes] = await Promise.all([
      fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: "Bearer " + token,
        },
      }),
      this.supabaseService.supabase.from("users").select("*").eq("id", userId),
    ]);

    const tuboUser = tuboUserRes.data?.[0];

    if (!tuboUser) {
      throw new BadRequest("Tubo User not found");
    }

    let newToken = null;

    if (spotifyRes.status === 401) {
      try {
        newToken = await getRefreshToken(tuboUser?.["refresh_token"] ?? "");

        spotifyRes = await fetch("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: "Bearer " + newToken,
          },
        });

        if (!spotifyRes.ok) {
          throw new Unauthorized("Failed to refresh token");
        }
      } catch (err) {
        throw err;
      }
    }

    return {
      spotifyUser: (await spotifyRes.json()) as SpotifyUser,
      tuboUser: tuboUser,
      newAccessToken: newToken,
    };
  }
}
