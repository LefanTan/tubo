import { CollectionOf, Nullable, Property, Required } from "@tsed/schema";
import { Image } from "./SharedSpotifyType";

/**
 * Internal representation of a user
 */
export class User {
  refresh_token?: string | null;

  @Required()
  id: string;

  @Nullable(String)
  display_name?: string | null;

  @Nullable(String)
  created_at?: string | null;

  @Nullable(String)
  email?: string | null;
}

/**
 * Matches the Spotify User object returned from Spotify's Web API.
 */
export class SpotifyUser {
  @Nullable(String)
  display_name?: string | null;

  @Required()
  email: string;

  @Property()
  external_urls: {
    spotify: string;
  };

  @Property()
  id: string;

  @CollectionOf(Image)
  images: Image[];
}
