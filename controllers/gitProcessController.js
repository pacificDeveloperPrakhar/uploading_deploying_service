const { exec } = require("child_process");
const generateRandomId=require('../utils/generateRandomId');
const { resolve } = require("path");
const { stderr, stdout } = require("process");
const executeBash = require("../utils/executeBash");
const path = require("path");
const mime=require("mime-types");
const { listAllFilesOnCloud } = require("./fileControllers");
// Middleware function
module.exports.processGitURL = async function (req, res, next) {
  const { url } = req.body;

  const check_url = () => {
    return new Promise((resolve, reject) => {
      exec(`git ls-remote ${url}`, (error, stdout, stderr) => {
        if (error) {
          return reject(new Error(`Invalid Git URL or inaccessible: ${stderr}`));
        }
        resolve({ stdout });
      });
    });
  };

  const data = await check_url();
  req.url=url;
  console.log("Git URL is valid:\n", data.stdout);
  next();
};
//middleware to clone the git repo
module.exports.cloneGit= async function(req,res,next){
    console.log("accessing the clone middleware")
    //generating random id
    const id=generateRandomId()
    //now create a promise
    const clone_git=function(url){
        return new Promise((resolve,reject)=>{
            exec(`git clone ${url} ${process.env.clone_output_path}/${id}`,(err,stdout,stderr)=>{
                if(err){
                    return reject(new Error(`error ${stderr}`));
                }
                resolve({ stdout });
            })
        })
    }
    const data=await clone_git(req.url)
 res.status(201).send(
{
    id,
    mssg:`successfully cloned the ${req.url} on server`
}
 )
}

module.exports.processAllFileList=async function(req,res,next){
 const {id}=req.query
 const {error,stdout,stderr}=await executeBash(`find /home/prakhar/Desktop/uploading_deploying_service/output/${id} -type f ! -path "*/.*/*"`)
 if(error){
 return res.status(400).json({
    status:"error",
    mssg:stderr,
    errStack:error
  })
 }
 const files_list=stdout.split("\n");
  console.log(files_list[1].split(process.env.output_path_relative)[1]);
  const data=files_list.filter((file)=>file!="").map(absPath => {
    const contentType= mime.lookup(absPath)||undefined
    const filePath=absPath;
    const fileName=path.basename(absPath)
    return {
      filePath,
      key:filePath.split(process.env.clone_output_path)[1],
      fileName,
      contentType
    }
  });;
console.log(files_list)

req.files_list=data
next()
}

module.exports.getAllFilesOnCloud=async function(req,res,next){
  const {id}=req.query
  const data =await listAllFilesOnCloud(id)
  res.status(200).json(data)

}