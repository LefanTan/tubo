import { CollectionOf, Nullable, Required } from "@tsed/schema";
import { Image } from "./SharedSpotifyType";

export class Playlist {
  @Required()
  id: string;

  @Required()
  name: string;

  @Nullable(String, null)
  description?: string | null;

  @Nullable(String, null)
  spotify_url?: string | null;

  @CollectionOf(Image)
  images: Image[];
}
