import webpush from "web-push";
import { db } from "./db";

webpush.setVapidDetails(
  "mailto:hello@wonderquest.app",
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function sendPushToGuardian(
  guardianId: string,
  payload: { title: string; body: string; url?: string },
) {
  const subs = await db.query(
    `SELECT endpoint, p256dh, auth FROM public.push_subscriptions WHERE guardian_id = $1`,
    [guardianId],
  );
  for (const sub of subs.rows) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({
          title: payload.title,
          body: payload.body,
          url: payload.url ?? "/parent",
        }),
      );
    } catch (err: unknown) {
      // Remove expired/invalid subscriptions (410 Gone)
      if (
        err &&
        typeof err === "object" &&
        "statusCode" in err &&
        (err as { statusCode: number }).statusCode === 410
      ) {
        await db.query(
          `DELETE FROM public.push_subscriptions WHERE endpoint = $1`,
          [sub.endpoint],
        );
      }
    }
  }
}
