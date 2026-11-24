import { EndUserError } from "./error.service";
import { uploadSave } from "./upload-save";

const save = new Uint8Array([1, 2, 3]);

// A fake PUT that answers each call with the next status and records the URLs it was called with
const fakePut = (...statuses: number[]) => {
  const urls: string[] = [];
  const put = (url: string) => {
    urls.push(url);
    return Promise.resolve(statuses.shift() ?? 200);
  };

  return { put, urls };
};

const expectUploadError = async (promise: Promise<void>, message: string) => {
  let error: unknown;

  try {
    await promise;
  } catch (e) {
    error = e;
  }

  expect(error).toBeInstanceOf(EndUserError);
  expect((error as EndUserError).message).toContain(message);
  expect((error as EndUserError).report).toBe(true);
};

describe("uploadSave", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  it("uploads once when Transfer Acceleration works", async () => {
    const { put, urls } = fakePut(200);

    await uploadSave("accel", "direct", save, put);

    expect(urls).toEqual(["accel"]);
  });

  it("retries on the regular endpoint after a 5xx", async () => {
    const { put, urls } = fakePut(504, 200);

    await uploadSave("accel", "direct", save, put);

    expect(urls).toEqual(["accel", "direct"]);
  });

  it("retries on the regular endpoint after a network error", async () => {
    const { put, urls } = fakePut(0, 200);

    await uploadSave("accel", "direct", save, put);

    expect(urls).toEqual(["accel", "direct"]);
  });

  it("doesn't retry errors a retry wouldn't fix", async () => {
    const { put, urls } = fakePut(403);

    await expectUploadError(uploadSave("accel", "direct", save, put), "status 403");
    expect(urls).toEqual(["accel"]);
  });

  it("fails without retrying when the api sent no fallback", async () => {
    const { put, urls } = fakePut(504);

    await expectUploadError(uploadSave("accel", undefined, save, put), "status 504");
    expect(urls).toEqual(["accel"]);
  });

  it("reports the fallback's failure when both fail", async () => {
    const { put, urls } = fakePut(504, 0);

    await expectUploadError(uploadSave("accel", "direct", save, put), "network error");
    expect(urls).toEqual(["accel", "direct"]);
  });
});
