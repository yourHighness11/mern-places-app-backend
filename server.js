require("dotenv").config();
const express = require("express");
const HttpError = require("./models/http-error");
const app = express();
const fs = require("fs");
const port = process.env.PORT || 5000;
const usersRoutes = require("./routes/users-routes");
const placesRoutes = require("./routes/places-routes");
const { default: mongoose } = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
app.use(cors());
mongoose.set("strictQuery", true);

app.use(bodyParser.json());
app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.use("/api/users", usersRoutes);
app.use("/api/places", placesRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured." });
});

mongoose
  .connect(process.env.DATABASE_URI)
  .then(() => {
    // console.log("connected to mongoDb");
    app.listen(port,()=>console.log("server running"));
  })
  .catch((err) => console.log(err));
