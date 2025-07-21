const Express = require("express");
const app = Express();
const generateRandomId = require("./utils/generateRandomId");
const catchAsync=require("./utils/catchAsync");
const {processGitURL}=require("./controllers/gitProcessController")
app.use(Express.json({ limit: "30kb" }));
app.use("/get_repo",catchAsync(processGitURL), catchAsync(async function(req,res,next){
    //first generate the random id
    const id=generateRandomId();
    res.send(id)
}))
app.use(function(req,res,next){
    res.send("welcome to the server")
})

module.exports=app