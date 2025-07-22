const Express = require("express");
const app = Express();
const generateRandomId = require("./utils/generateRandomId");
const catchAsync=require("./utils/catchAsync");
const {processGitURL,cloneGit, processAllFileList}=require("./controllers/gitProcessController");
const executeBash = require("./utils/executeBash");
const {uploadS3}=require("./controllers/fileControllers")
app.use(Express.json({ limit: "30kb" }));
//acces the git ,verify it,clone it
app.route("/get_repo").post(catchAsync(processGitURL), catchAsync(cloneGit))
//get all the files in the repo
app.route("/track").post(processAllFileList,async(req,res,next)=>{
 res.status(200).json(req.files_list)
})
// deploy the github repo using the id provide in the query
app.route("/deploy").post(processAllFileList,async(req,res,next)=>{
  const result=await Promise.all( req.files_list.map(async(file) => {
   return await uploadS3(file.key,file.filePath)
  }));
  console.log(result)
  res.status(200).json(result)
 })
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