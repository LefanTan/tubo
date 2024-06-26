import { Track } from "@src/models/Track";
import fetch, { RequestInit, Response } from "node-fetch";

export function generateRandomString(length: number) {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export async function makeSpotifyRequestWithBackoff(
  url: string,
  requestInit?: RequestInit,
  retries = 5
) {
  try {
    const res = await fetch(url, requestInit);

    if (res.status === 426) {
      throw new Error(
        JSON.stringify({
          message: "Rate limit exceeded",
          retryTime: res.headers.get("Retry-After") ?? 5,
        })
      );
    }

    return res;
  } catch (err) {
    if (retries > 0) {
      const retryTime: number = JSON.parse(err.message).retryTime;
      console.log(`Rate limit exceeded. Retrying in ${retryTime} seconds...`);

      await new Promise((resolve) => {
        setTimeout(resolve, retryTime * 1000);
      });

      return makeSpotifyRequestWithBackoff(url, requestInit, retries - 1);
    } else {
      throw new Error("Maximum retries exceeded.");
    }
  }
}

export async function convertTrackResponseToTracks(res: Response) {
  const resultsJson = await res.json();
  const tracks: Track[] = resultsJson["items"].flatMap(
    (savedTrackObject: any) => {
      if (!savedTrackObject) return [];

      const track = savedTrackObject["track"] as Track;
      track.added_at = savedTrackObject["added_at"];
      return track;
    }
  );

  return { tracks, total: resultsJson["total"] ?? 0 };
}

export async function getRefreshToken(refreshToken: string): Promise<string> {
  // Refresh access token and try again
  const form = new URLSearchParams();
  form.append("refresh_token", refreshToken);
  form.append("grant_type", "refresh_token");

  const refreshAccessRes = await fetch(
    "https://accounts.spotify.com/api/token",
    {
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
    }
  )
    .catch((err) => {
      throw new Error("Failed to refresh access token");
    })
    .then((res) => res.json());

  return refreshAccessRes["access_token"];
}
