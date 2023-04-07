const express = require("express");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const { PORT, AUTH_SERVICE_URL, BOOKING_SERVICE_URL, SEARCH_SERVICE_URL } = require("./config/serverConfig");
const {
  isAuthenticated,
  validateAuthRequest,
  validateFlightRequest,
  errorHandler,
} = require("./middlewares/request-middleware.js");

const app = express();

// const PORT = 3006;

const limiter = rateLimit({
  windowMs: 15 * 1000, // 15 sec
  max: 15, // Limit each IP to 15 requests per `window` (here, per 15 sec)
});

app.use(cors());
app.use(morgan("combined"));
app.use(limiter);

app.use(
  "/authservice",
  validateAuthRequest,
  createProxyMiddleware({ target: AUTH_SERVICE_URL, changeOrigin: true, onError: errorHandler })
);
app.use(
  "/bookingservice",
  isAuthenticated,
  createProxyMiddleware({ target: BOOKING_SERVICE_URL, changeOrigin: true, onError: errorHandler })
);

app.use(
  "/searchservice",
  validateFlightRequest,
  createProxyMiddleware({
    target: SEARCH_SERVICE_URL,
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
