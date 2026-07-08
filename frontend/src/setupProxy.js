const { createProxyMiddleware } = require("http-proxy-middleware");

const ACCOUNT = process.env.ACCOUNT_SERVICE_URL || "http://localhost:8081";
const MARKET = process.env.MARKET_SERVICE_URL || "http://localhost:8082";

const accountPaths = [
  "/auth",
  "/portfolio",
  "/getMyProfile",
  "/changeProfile",
  "/deleteMyAccount",
  "/getAdmin",
  "/bugReport",
  "/api/auth",
  "/api/account",
];

const marketPaths = ["/stocks", "/news", "/api/market", "/api/news"];

const apiOnly = (paths) => (pathname, req) => {
  const accept = req.headers.accept || "";
  if (accept.includes("text/html")) return false;
  return paths.some((p) => pathname === p || pathname.startsWith(p + "/"));
};

module.exports = function (app) {
  app.use(createProxyMiddleware(apiOnly(accountPaths), { target: ACCOUNT, changeOrigin: true }));
  app.use(createProxyMiddleware(apiOnly(marketPaths), { target: MARKET, changeOrigin: true }));
  app.use(
    createProxyMiddleware((pathname) => pathname.startsWith("/ws"), {
      target: MARKET,
      changeOrigin: true,
      ws: true,
    })
  );
};
