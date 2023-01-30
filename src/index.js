const express = require("express");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");
const axios = require("axios");

const app = express();

const { PORT } = require("./config/serverConfig");

const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 5, // Limit each IP to 5 requests per `window` (here, per 2 minutes)
});

app.use(morgan("combined"));

app.use(limiter);

app.use("/bookingservice", async (req, res, next) => {
  console.log(req.headers["x-access-token"]);
  try {
    const response = await axios.get("http://localhost:3002/api/v1/isAuthenticated", {
      headers: {
        "x-access-token": req.headers["x-access-token"],
      },
    });
    if (response.data.success) {
      next();
    } else {
      return res.status(401).json({
        message: " Unauthorised ",
      });
    }
  } catch (error) {
    return res.status(error.response.status).json({
      message: "You are not Unauthorised to access this route",
    });
  }
});

app.use("/bookingservice", createProxyMiddleware({ target: "http://localhost:3003/", changeOrigin: true }));

app.get("/home", (req, res) => {
  return res.json({ message: "Ok" });
});

app.listen(PORT, () => {
  console.log(`Server started at Port:${PORT}`);
});
