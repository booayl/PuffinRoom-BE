const userRouter = require("express").Router();

const {
getUsers,
selectUser
} = require("../controllers");

userRouter.get('/',getUsers);
userRouter.get('/:username',selectUser);

module.exports = userRouter;