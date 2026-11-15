import envVars from "../../envVars";

// Lets non-prod builds (the dev site, local) switch which API they talk to at runtime:
//   ?api=dev      use api-dev
//   ?api=prod     use the prod API
//   ?api=default  go back to whatever this build was built with
// The choice is remembered in localStorage. Prod builds ignore all of it.

export const API_URLS = {
  prod: "https://api.playyourdamnturn.com",
  dev: "https://api-dev.playyourdamnturn.com",
} as const;

export type ApiChoice = keyof typeof API_URLS;

export const API_OVERRIDE_STORAGE_KEY = "apiOverride";

export interface ApiOverrideResult {
  apiUrl: string;
  // Set when the URL had an ?api= parameter: what localStorage should now hold (null = remove it)
  storeChoice?: ApiChoice | null;
  // True when the API actually changed, so the login token (which belongs to one API) must go
  apiChanged: boolean;
  // The query string with the api parameter removed, when there was one
  cleanSearch?: string;
}

const isChoice = (value: string | null): value is ApiChoice => value === "prod" || value === "dev";

// Pure version, so it's easy to test: no window, storage or envVars access
export const resolveApiOverride = (
  stage: string,
  defaultUrl: string,
  search: string,
  storedChoice: string | null,
): ApiOverrideResult => {
  if (stage === "prod") {
    return { apiUrl: defaultUrl, apiChanged: false };
  }

  const urlFor = (choice: string | null) => (isChoice(choice) ? API_URLS[choice] : defaultUrl);
  const previousUrl = urlFor(storedChoice);
  const params = new URLSearchParams(search);
  const requested = params.get("api");

  if (requested === null) {
    return { apiUrl: previousUrl, apiChanged: false };
  }

  params.delete("api");
  const rest = params.toString();
  const cleanSearch = rest ? `?${rest}` : "";

  if (!isChoice(requested) && requested !== "default") {
    // Typo or junk: keep whatever was in effect, but tidy the URL
    return { apiUrl: previousUrl, apiChanged: false, cleanSearch };
  }

  const storeChoice = isChoice(requested) ? requested : null;
  const apiUrl = urlFor(storeChoice);

  return { apiUrl, storeChoice, apiChanged: apiUrl !== previousUrl, cleanSearch };
};

let resolvedApiUrl: string | undefined;

// The API URL this page load should use. Applies any ?api= parameter once (storing the choice,
// logging out if the API changed, and removing the parameter from the address bar).
export const currentApiUrl = (): string => {
  if (resolvedApiUrl) {
    return resolvedApiUrl;
  }

  const inBrowser = typeof window !== "undefined" && typeof window.location !== "undefined";
  let stored: string | null = null;

  try {
    stored = localStorage.getItem(API_OVERRIDE_STORAGE_KEY);
  } catch {
    // Storage unavailable (privacy mode, SSR shim): just use the default
  }

  const result = resolveApiOverride(envVars.stage, envVars.apiUrl, inBrowser ? window.location.search : "", stored);

  try {
    if (result.storeChoice) {
      localStorage.setItem(API_OVERRIDE_STORAGE_KEY, result.storeChoice);
    } else if (result.storeChoice === null) {
      localStorage.removeItem(API_OVERRIDE_STORAGE_KEY);
    }

    if (result.apiChanged) {
      // A login token only works on the API that issued it
      localStorage.removeItem("token");
      localStorage.removeItem("steamProfile");
    }
  } catch {
    // Ignore storage failures
  }

  if (inBrowser && result.cleanSearch !== undefined) {
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname + result.cleanSearch + window.location.hash,
    );
  }

  resolvedApiUrl = result.apiUrl;
  return resolvedApiUrl;
};

// For the footer badge: which API is in use, and whether switching is offered on this build
export const apiOverrideInfo = (): { allowed: boolean; current: ApiChoice | "custom" } => {
  const url = currentApiUrl();
  const current = (Object.keys(API_URLS) as ApiChoice[]).find(k => API_URLS[k] === url) ?? "custom";

  return { allowed: envVars.stage !== "prod", current };
};
