/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: ["**/.*", "**/*.test.{js,jsx,ts,tsx}"],
  serverModuleFormat: "cjs",
  serverDependenciesToBundle: [/remix-utils/, /nanoid/],
};
