const logger = require("morgan");
const dotenv = require("dotenv");
const colors = require("colors");
const express = require("express");

const app = express();
app.use(express.json());

const { DEV } = require("./src/constants");

if (process.env.NODE_ENV === DEV) {
  app.use(logger("dev"));
  dotenv.config({ path: "./config/development.env" });
} else {
  app.use(logger("prod"));
  dotenv.config({ path: "./config/production.env" });
}

app.use("/api/v1/inventory", require("./routes/inventoryRoutes"));

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}!`.yellow
      .bold
  );
});

// Handle unhandled promise rejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
});
