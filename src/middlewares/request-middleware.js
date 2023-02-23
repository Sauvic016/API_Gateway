const axios = require("axios");

const authService = axios.create({
  baseURL: "http://localhost:3002/authservice/api/v1/",
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
        message: "Unauthorized",
      });
    }
    req.id = authData.data;
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

module.exports = {
  isAuthenticated,
  validateAuthRequest,
  validateFlightRequest,
};
