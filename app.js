const Express = require("express");
const app = Express();
const generateRandomId = require("./utils/generateRandomId");
const catchAsync=require("./utils/catchAsync");
const {processGitURL,cloneGit, processAllFileList}=require("./controllers/gitProcessController")
app.use(Express.json({ limit: "30kb" }));
//acces the git ,verify it,clone it
app.route("/get_repo").post(catchAsync(processGitURL), catchAsync(cloneGit))
//get all the files in the repo
app.route("/get_repo_files").post(processAllFileList)
// errorMiddleware.js

app.use(function errorHandler(err, req, res, next) {
    console.error(err.stack); 
  
    const statusCode = err.statusCode || 500;
  
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Internal Server Error',
    
      ...(process.env.node === 'development' && { stack: err.stack }),
    });
  }
)

  

module.exports=app