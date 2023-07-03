import { Controller } from "@tsed/common";
import { Get } from "@tsed/schema";

@Controller("/")
export class IndexController {
  @Get("/")
  get() {
    return { message: "success" };
  }
}
