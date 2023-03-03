const express = require("express");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");
const { PORT } = require("./config/serverConfig");
const {
  isAuthenticated,
  validateAuthRequest,
  validateFlightRequest,
  errorHandler,
} = require("./middlewares/request-middleware.js");

const app = express();

// const PORT = 3006;

const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 5, // Limit each IP to 5 requests per `window` (here, per 2 minutes)
});

app.use(morgan("combined"));
app.use(limiter);

app.use(
  "/authservice",
  validateAuthRequest,
  createProxyMiddleware({ target: "http://localhost:3002/", changeOrigin: true, onError: errorHandler })
);
app.use(
  "/bookingservice",
  isAuthenticated,
  createProxyMiddleware({ target: "http://localhost:3003/", changeOrigin: true, onError: errorHandler })
);

app.use(
  "/searchservice",
  validateFlightRequest,
  createProxyMiddleware({
    target: "http://localhost:3001/",
    changeOrigin: true,
    onError: errorHandler,
  })
);

app.get("/home", (req, res) => {
  return res.json({ message: "Ok" });
});

app.listen(PORT, () => {
  console.log(`Server started at Port:${PORT}`);
});
