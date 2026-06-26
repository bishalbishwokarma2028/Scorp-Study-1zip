// Vercel serverless entry point — wraps the bundled Express app
// The app.mjs bundle is self-contained (esbuild bundled all deps)
let cachedApp;

async function getApp() {
  if (!cachedApp) {
    const mod = await import("../artifacts/api-server/dist/app.mjs");
    cachedApp = mod.default;
  }
  return cachedApp;
}

module.exports = async function handler(req, res) {
  const app = await getApp();
  app(req, res);
};
