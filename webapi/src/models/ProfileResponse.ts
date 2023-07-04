import { Nullable, Property } from "@tsed/schema";
import { SpotifyUser, User } from "./User";

export class ProfileResponse {
  @Property()
  tuboUser: User;

  @Property()
  spotifyUser: SpotifyUser;

  @Nullable(String, null)
  newAccessToken?: string | null;
}
