const express = require("express");
const app = express();
app.use(express.json());

const { getTopics } = require("./controllers");

app.get("/api/topics", getTopics);


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
