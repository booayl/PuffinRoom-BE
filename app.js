const express = require("express");
const app = express();
const apiRouter = require('./routes/api-router');

app.use(express.json());

//Respond a list of all available endpoints from endpoint.json
app.use("/api", apiRouter);

//Error Handling Middleware
app.all("*", (req, res) => {
  res.status(404).send("Invalid Endpoint");
});

app.use((err, req, res, next) => {
  //Non-existent ID
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }
  next(err);
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad Request" });
  }

  if (err.code === "23503") {
    res.status(404).send({ msg: "Not Found" });
  }

  if (err.code === "23502") {
    res.status(400).send({ msg: "Incomplete/Missing Body" });
  }

  if(err.code === "23505"){
    res.status(409).send({ msg: "Body Already Exists" });
  }

  next(err);
});

app.use((err, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error" });
});

module.exports = app;
