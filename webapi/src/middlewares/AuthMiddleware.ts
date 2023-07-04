import { Context, Middleware, MiddlewareMethods } from "@tsed/common";
import { Unauthorized } from "@tsed/exceptions";

@Middleware()
export class AuthMiddleware implements MiddlewareMethods {
  use(@Context() $ctx: Context) {
    const { request } = $ctx;
    const { headers } = request;

    const token = headers["authorization"]?.replace("Bearer ", "");

    if (!token) {
      throw new Unauthorized("User not authorized. No token provided.");
    }

    $ctx.set("token", token);
    return true;
  }
}
