const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  PORT: process.env.PORT,
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL,
  BOOKING_SERVICE_URL: process.env.BOOKING_SERVICE_URL,
  SEARCH_SERVICE_URL: process.env.SEARCH_SERVICE_URL,
};
