const proxy = require("http-proxy-middleware");
module.exports = function(app) {
  app.use(
    "/api",
    proxy({
      target: process.env.API_HOST || "http://localhost:8000",
      changeOrigin: true
    })
  );
};
