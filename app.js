const Express = require("express");
const app = Express();
const generateRandomId = require("./utils/generateRandomId");
const catchAsync=require("./utils/catchAsync");
const {processGitURL,cloneGit, processAllFileList, getAllFilesOnCloud}=require("./controllers/gitProcessController");
const executeBash = require("./utils/executeBash");
const {uploadS3}=require("./controllers/fileControllers")
const client =require("./redisConnect")
app.use(Express.json({ limit: "30kb" }));
//acces the git ,verify it,clone it
app.route("/clone").post(catchAsync(processGitURL), catchAsync(cloneGit))
//get all the files in the repo
app.route("/track").post(processAllFileList,async(req,res,next)=>{
 res.status(200).json(req.files_list)
})

// deploy the github repo using the id provide in the query
app.route("/deploy").post(processAllFileList,async(req,res,next)=>{
  const result=await Promise.all( req.files_list.map(async(file) => {
   return await uploadS3(file.key,file.filePath)
  }));
  await client.lPush( process.env.queue,req.query.id);
  res.status(200).json(result)
 })
//  ============================================================
// checking the redis queue
app.use("/redis",(req,res,next)=>{
  client.lPush("vercelCloneQueue","my data")
})
//get all the files on the cloud after uploading
app.use("/get_uploaded_files",getAllFilesOnCloud)
//this is the error handling middleware
// =================================================================
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