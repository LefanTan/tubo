import { Required } from "@tsed/schema";

export class Image {
  @Required()
  url: string;

  @Required()
  height: number;

  @Required()
  width: number;
}
