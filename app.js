const express = require("express");
const app = express();
const endpoints = require("./endpoints.json")

app.use(express.json());
app.get

const { getTopics } = require("./controllers");

app.get("/api/topics", getTopics);

app.get("/api",(req,res,next)=>{
    res.status(200).send({endpoints})
})

//Error Handling Middleware
app.use((req,res)=>{
    res.status(404).send("Invalid Endpoint")
})

app.use((err,req,res,next)=>{
    if (err.status && err.msg) {
        res.status(err.status).send({ msg : err.msg })
    }else next(err)
})

app.use((err, req, res, next) => {
    res.status(500).send({ msg: 'Internal Server Error' });
  });

module.exports = app;
