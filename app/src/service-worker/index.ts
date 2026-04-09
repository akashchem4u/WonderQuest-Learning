/// <reference lib="webworker" />
export type {}; // isolate module scope — prevents conflict with dom lib's `self`

declare const self: ServiceWorkerGlobalScope;

self.addEventListener("push", (event: PushEvent) => {
  const data = event.data?.json() as { title?: string; body?: string; url?: string } ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "WonderQuest", {
      body: data.body ?? "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: data.url ?? "/parent" },
    }),
  );
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow((event.notification.data as { url: string }).url),
  );
});
