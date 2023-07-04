import { Format, Required } from "@tsed/schema";

export class Track {
  @Format("date-time")
  added_at: string;

  @Required()
  uri: string;

  @Required()
  name: string;

  @Required()
  id: string;
}
