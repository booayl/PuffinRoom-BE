const express = require("express");
const app = express();
const endpoints = require("./endpoints.json");

app.use(express.json());
app.get;

const { getTopics, getArticleById , getArticles, getCommentsByArticleID} = require("./controllers");

//Respond a list of all available endpoints from endpoint.json
app.get("/api", (req, res, next) => {
  res.status(200).send({ endpoints });
});

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles", getArticles)
app.get("/api/articles/:article_id/comments", getCommentsByArticleID)

//Error Handling Middleware
app.all("*",(req, res) => {
  res.status(404).send("Invalid Endpoint");
});

//Invalid ID Input
app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }
  next(err);
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Invalid ID Type" });
  }
  next(err);
});

app.use((err, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error" });
});

module.exports = app;
