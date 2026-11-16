// Runs before the app (listed after "zone.js" in angular.json's polyfills).
// dragula expects a Node-style `global`; this has to happen before it loads.
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
(window as any).global = window;
