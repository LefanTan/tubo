import { isProduction } from "@src/config/envs";
import { generateRandomString } from "@src/helpers/misc";
import { Controller } from "@tsed/di";
import { Unauthorized } from "@tsed/exceptions";
import { Context, QueryParams } from "@tsed/platform-params";
import { Description, Get, Name } from "@tsed/schema";

import fetch from "node-fetch";
import querystring from "node:querystring";

@Controller("/auth")
@Name("AuthController")
export class AuthController {
  stateCompare: Set<string> = new Set();
  redirectUrl = "http://localhost:8087/rest/auth/redirect";

  constructor() {
    //
  }

  @Get("/login")
  async login(@Context() ctx: Context) {
    // TODO: Different depending on Env

    // Protect agains CSRF
    const state = generateRandomString(16);
    const scope =
      "user-library-read user-library-modify user-read-email playlist-modify-public";

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

    ctx.response.cookie("access-token", json["access_token"], {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
    });

    return ctx.response.redirect(302, "http://localhost:5173/app");
  }

  @Get("/refresh-token")
  @Description("Grab a fresh access token")
  async refreshToken(@Context() ctx: Context) {
    //
  }
}
