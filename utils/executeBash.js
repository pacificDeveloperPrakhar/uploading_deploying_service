const {exec}=require("child_process")
const { stderr } = require("process")
module.exports=function execute_bash(query){
    return new Promise((resolve,reject)=>{
        exec(query,(error,stdout,stderr)=>{
            if(error)
                return reject(new Error(`error ${stderr}`));
            resolve({ stdout });
        })
    })
}