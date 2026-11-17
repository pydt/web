import { SwPush } from "@angular/service-worker";
import { firstValueFrom, Observable, of, throwError } from "rxjs";
import { NotificationService } from "./notification.service";

const makeService = (isEnabled: boolean, subscription: Observable<PushSubscription | null>) =>
  new NotificationService({ isEnabled, subscription } as unknown as SwPush, null);

describe("NotificationService.pushState$", () => {
  // jsdom has no PushManager; give it one unless a test removes it
  beforeEach(() => {
    (window as unknown as Record<string, unknown>).PushManager = class {};
  });

  afterEach(() => {
    delete (window as unknown as Record<string, unknown>).PushManager;
  });

  it("reports the subscribed endpoint when push works", async () => {
    const svc = makeService(true, of({ endpoint: "https://push.example/abc" } as PushSubscription));

    expect(await firstValueFrom(svc.pushState$)).toEqual({ supported: true, endpoint: "https://push.example/abc" });
  });

  it("is supported but has no endpoint when not subscribed", async () => {
    const svc = makeService(true, of(null));

    expect(await firstValueFrom(svc.pushState$)).toEqual({ supported: true, endpoint: undefined });
  });

  it("is unsupported without a service worker", async () => {
    const svc = makeService(false, of(null));

    expect(await firstValueFrom(svc.pushState$)).toEqual({ supported: false });
  });

  it("is unsupported when the browser has no PushManager", async () => {
    delete (window as unknown as Record<string, unknown>).PushManager;
    const svc = makeService(true, of(null));

    expect(await firstValueFrom(svc.pushState$)).toEqual({ supported: false });
  });

  it("is unsupported instead of erroring when the registration has no pushManager (iOS in a normal tab)", async () => {
    const svc = makeService(
      true,
      throwError(() => new TypeError("undefined is not an object (evaluating 'r.getSubscription')")),
    );

    expect(await firstValueFrom(svc.pushState$)).toEqual({ supported: false });
  });
});
