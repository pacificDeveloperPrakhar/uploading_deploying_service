const SimpleGit=require("simple-git")
const {exec}=require("child_process")
module.exports.processGitURL=async function (req,res,next){
    //extract the url
    const {url}=req.body
    //convert the exec to promise
    const check_url=function(){
        
    return new Promise((resolve,reject)=>{
     exec(`git ls-remote ${url}`,(error,stdout,stderr)=>{
        if(error){
            reject({
                error,
                stderr
            })
            return
        }
        resolve({
            stdout
        })
     })
    })}
    const data=await check_url()
    console.log(data)
    next()

}