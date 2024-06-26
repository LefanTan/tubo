import { join } from "path";
import { Configuration, Inject } from "@tsed/di";
import { PlatformApplication } from "@tsed/common";
import "@tsed/platform-express"; // /!\ keep this import
import "@tsed/ajv";
import "@tsed/swagger";
import { config } from "./config/index";
import * as rest from "./controllers/rest/index";
import { isProduction } from "./config/envs";
import cors from "cors";

@Configuration({
  ...config,
  acceptMimes: ["application/json"],
  httpPort: process.env.PORT || 8087,
  httpsPort: false, // CHANGE
  disableComponentsScan: true,
  mount: {
    "/rest": [...Object.values(rest)],
  },
  swagger: [
    {
      path: "/doc",
      specVersion: "3.0.1",
      outFile: "./swagger.json",
      viewPath: isProduction ? false : undefined,
    },
  ],
  middlewares: [
    "cookie-parser",
    "compression",
    "method-override",
    "json-parser",
    { use: "urlencoded-parser", options: { extended: true } },
  ],
  views: {
    root: join(process.cwd(), "../views"),
    extensions: {
      ejs: "ejs",
    },
  },
  exclude: ["**/*.spec.ts"],
})
export class Server {
  @Inject()
  protected app: PlatformApplication;

  @Configuration()
  protected settings: Configuration;

  $beforeRoutesInit() {
    this.app.use(
      cors({
        origin: isProduction
          ? "https://tubo-ca974.web.app"
          : "http://localhost:5173",
        credentials: true,
      })
    );
  }
}
