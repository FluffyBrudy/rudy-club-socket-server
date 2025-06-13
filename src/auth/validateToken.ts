import "jsr:@std/dotenv/load";
import { jwtVerify } from "npm:jose";
import { Payload } from "../types/auth.ts";
import { ERROR_MESSAGES } from "../constants.ts";

export async function verifyAuthToken(
  req: Request
): Promise<[null | { error: string }, Payload | null]> {
  try {
    const token = req.headers.get("Authorization");
    if (!token) return [ERROR_MESSAGES.NO_AUTH_TOKEN, null];

    const secret = Deno.env.get("JWT_SECRET")!;
    const encodedSecret = new TextEncoder().encode(secret);

    const { payload } = await jwtVerify(token, encodedSecret);
    return [null, payload as unknown as Payload];
  } catch (error) {
    console.error("Invalid JWT", (error as Error).message);
    return [{ error: (error as Error).message }, null];
  }
}

// async function mockLogin() {
//   const login = await fetch("http://localhost:3000/api/auth/login", {
//     headers: {
//       "Content-Type": "application/json",
//     },
//     method: "POST",
//     body: JSON.stringify({
//       email: "ball@gmail.com",
//       password: "Applefruit#12",
//     }),
//   });
//   const content = await login.json();
//   return content.data.accessToken;
// }
