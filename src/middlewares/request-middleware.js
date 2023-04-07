const axios = require("axios");
const { AUTH_SERVICE_URL } = require("../config/serverConfig");

const authService = axios.create({
  baseURL: `${AUTH_SERVICE_URL}authservice/api/v1/`,
});

const isAuthenticated = async (req, res, next) => {
  // console.log(req.headers["x-access-token"]);
  try {
    const { data: authData } = await authService.get("isAuthenticated", {
      headers: {
        "x-access-token": req.headers["x-access-token"],
      },
    });
    if (!authData.success) {
      return res.status(401).json({
        message: "Please, Login and try again",
      });
    }
    if (authData.data.userStatus !== "Active") {
      return res.status(401).json({
        message: "Please , Verify your email address and try again",
      });
    }
    req.id = authData.data.id;
    next();
  } catch (error) {
    return res.status(error.response.status || 500).json({
      message: error.response.data.message || "Something went wrong in the server",
    });
  }
};

const verifyRole = async (req, res, next) => {
  try {
    const { data: authData } = await authService.get("isAuthenticated", {
      headers: {
        "x-access-token": req.headers["x-access-token"],
      },
    });
    if (!authData.success) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const { data: adminData } = await authService.get("isAdmin", {
      data: {
        id: authData.data,
      },
    });
    if (!adminData.data) {
      return res.status(403).json({
        message: "Forbidden, User does not have admin role",
      });
    }
    next();
  } catch (error) {
    return res.status(error.response.status || 500).json({
      message: "Unauthorized, Unable to verify role",
    });
  }
};

const validateAuthRequest = async (req, res, next) => {
  if (req.path !== "/api/v1/grantrole") {
    return next();
  }
  await verifyRole(req, res, next);
};

const validateFlightRequest = async (req, res, next) => {
  console.log(req.method, req.path);
  if (req.method === "GET" && req.path !== "/api/v1/allflights") {
    return next();
  }
  await verifyRole(req, res, next);
};

const errorHandler = (err, req, res) => {
  console.error(err);
  res.status(500).send("Internal server error");
};
module.exports = {
  isAuthenticated,
  validateAuthRequest,
  validateFlightRequest,
  errorHandler,
};
