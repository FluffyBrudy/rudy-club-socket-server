import "@std/dotenv/load";
import { jwtVerify } from "jose";
import { Payload } from "../types/auth.ts";

export async function verifyAuthToken(
  req: Request
): Promise<[null | string, Payload | null]> {
  try {
    const token = req.headers.get("Authorization");
    if (!token) return ["no auth token provided", null];

    const secret = Deno.env.get("JWT_SECRET")!;
    const encodedSecret = new TextEncoder().encode(secret);

    const { payload } = await jwtVerify(token, encodedSecret);
    return [null, payload as unknown as Payload];
  } catch (error) {
    console.error("Invalid JWT", (error as Error).message);
    return [(error as Error).message, null];
  }
}
