import { Format } from "@tsed/schema";

export class Track {
  @Format("date-time")
  added_at: string;
}
