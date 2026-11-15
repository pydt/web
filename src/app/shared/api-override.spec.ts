import { API_URLS, resolveApiOverride } from "./api-override";

const BUILD_DEFAULT = "https://api.playyourdamnturn.com";

describe("resolveApiOverride", () => {
  it("ignores everything on prod builds", () => {
    const r = resolveApiOverride("prod", BUILD_DEFAULT, "?api=dev", "dev");

    expect(r).toEqual({ apiUrl: BUILD_DEFAULT, apiChanged: false });
  });

  it("uses the build default with no parameter and nothing stored", () => {
    expect(resolveApiOverride("dev", BUILD_DEFAULT, "", null)).toEqual({ apiUrl: BUILD_DEFAULT, apiChanged: false });
  });

  it("keeps a stored choice across page loads", () => {
    expect(resolveApiOverride("dev", BUILD_DEFAULT, "", "dev").apiUrl).toBe(API_URLS.dev);
  });

  it("switches to dev, stores it, and flags the API change", () => {
    const r = resolveApiOverride("dev", BUILD_DEFAULT, "?api=dev", null);

    expect(r.apiUrl).toBe(API_URLS.dev);
    expect(r.storeChoice).toBe("dev");
    expect(r.apiChanged).toBeTrue();
    expect(r.cleanSearch).toBe("");
  });

  it("doesn't flag a change when asking for the API already in use", () => {
    const r = resolveApiOverride("dev", BUILD_DEFAULT, "?api=dev", "dev");

    expect(r.apiChanged).toBeFalse();
  });

  it("goes back to the build default with ?api=default", () => {
    const r = resolveApiOverride("local", BUILD_DEFAULT, "?api=default", "dev");

    expect(r.apiUrl).toBe(BUILD_DEFAULT);
    expect(r.storeChoice).toBeNull();
    expect(r.apiChanged).toBeTrue();
  });

  it("keeps other query parameters", () => {
    expect(resolveApiOverride("dev", BUILD_DEFAULT, "?foo=1&api=dev&bar=2", null).cleanSearch).toBe("?foo=1&bar=2");
  });

  it("ignores junk values but still tidies the URL", () => {
    const r = resolveApiOverride("dev", BUILD_DEFAULT, "?api=staging", "dev");

    expect(r.apiUrl).toBe(API_URLS.dev);
    expect(r.storeChoice).toBeUndefined();
    expect(r.apiChanged).toBeFalse();
    expect(r.cleanSearch).toBe("");
  });
});
