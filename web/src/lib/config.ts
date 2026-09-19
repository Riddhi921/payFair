/**
 * Whether the app should even attempt to reach the Express server.
 *
 * - In `vite dev` (local development), always true -- the dev proxy forwards
 *   /api/* to the local server, matching the existing local workflow.
 * - In a production build, false UNLESS the build was explicitly run with
 *   VITE_ENABLE_SERVER=true (e.g. a self-hosted deployment that also runs
 *   the server, or a Vercel deployment with the server ported to a
 *   serverless function under the same domain).
 *
 * A static deployment (Vercel static build, GitHub Pages) leaves this false,
 * so the app never issues a network request to a server that doesn't exist
 * there -- no failed fetches, no console noise. Every feature still works
 * via the deterministic template fallback baked into the client bundle.
 */
export const SERVER_ENABLED: boolean = import.meta.env.DEV || import.meta.env.VITE_ENABLE_SERVER === "true";
