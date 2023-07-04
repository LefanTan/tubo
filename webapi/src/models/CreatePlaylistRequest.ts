import { Nullable, Required } from "@tsed/schema";

export class CreatePlaylistRequest {
  @Required()
  name: string;

  @Nullable(String, null)
  description: string;

  @Nullable(Boolean, null)
  public: boolean;
}
