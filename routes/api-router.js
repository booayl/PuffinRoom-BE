const apiRouter = require('express').Router();
const endpoints = require("../endpoints.json");

const topicRouter = require("./topic-router");
const articlesRouter = require("./articles-router");
const commentRouter = require("./comments-router");
const userRouter = require("./users-router");

apiRouter.use("/topics", topicRouter);
apiRouter.use("/articles", articlesRouter);
apiRouter.use("/comments", commentRouter);
apiRouter.use("/users", userRouter);

apiRouter.get("/", (req, res, next) => {
    res.status(200).send({ endpoints });
});

// Catch-all middleware for handling invalid endpoints
apiRouter.all("*", (req, res) => {
    res.status(404).send("Invalid Endpoint");
    next()
});

module.exports = apiRouter;
