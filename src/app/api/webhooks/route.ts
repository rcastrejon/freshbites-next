import { Webhook } from "svix";
import { headers } from "next/headers";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "../../../lib/db";
import { userTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = (await req.json()) as unknown;
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const [user] = await db
      .insert(userTable)
      .values({
        id: evt.data.id,
        username: evt.data.username!,
        firstName: evt.data.first_name!,
        lastName: evt.data.last_name!,
        imageUrl: evt.data.image_url,
        createdAt: evt.data.created_at,
      })
      .onConflictDoUpdate({
        target: userTable.id,
        set: {
          username: evt.data.username!,
          firstName: evt.data.first_name!,
          lastName: evt.data.last_name!,
          imageUrl: evt.data.image_url,
          createdAt: evt.data.created_at,
        },
      })
      .returning();

    if (!user) {
      return new Response("Error occurred", {
        status: 400,
      });
    }
  }

  if (evt.type === "user.deleted") {
    const result = await db
      .delete(userTable)
      .where(eq(userTable.id, evt.data.id!));
    if (result.rowsAffected < 1) {
      return new Response("Error occurred", {
        status: 400,
      });
    }
  }

  return new Response("", { status: 200 });
}
