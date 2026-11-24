import { EndUserError } from "./error.service";

// PUTs a gzipped save to a presigned S3 URL. Resolves with the HTTP status, or 0 for a network error.
export const putSave = (url: string, save: Uint8Array<ArrayBuffer>): Promise<number> =>
  new Promise(resolve => {
    const xhr = new XMLHttpRequest();

    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", "application/octet-stream");
    xhr.onload = () => resolve(xhr.status);
    xhr.onerror = () => resolve(0);
    xhr.send(save);
  });

/**
 * Uploads a save through S3 Transfer Acceleration (putUrl). Acceleration has had 504 outages (forum
 * #14499), so a network error or 5xx retries once on the regular endpoint (fallbackPutUrl) when the api
 * sent one. Anything else (e.g. a 403 for an expired URL) wouldn't be fixed by retrying. Throws a
 * reported EndUserError if the upload didn't land.
 */
export const uploadSave = async (
  putUrl: string,
  fallbackPutUrl: string | undefined,
  save: Uint8Array<ArrayBuffer>,
  put = putSave,
): Promise<void> => {
  let status = await put(putUrl, save);

  if ((status === 0 || status >= 500) && fallbackPutUrl) {
    console.warn(`Save upload through S3 Transfer Acceleration failed (${status}), retrying directly`);
    status = await put(fallbackPutUrl, save);
  }

  if (status !== 200) {
    throw new EndUserError(
      `Uploading the save failed (${status ? `status ${status}` : "network error"}). Please try again in a few minutes.`,
      true,
    );
  }
};
