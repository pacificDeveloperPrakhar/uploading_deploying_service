const dotenv = require("dotenv");
dotenv.config({ path: "../config.env" });
const client=require("../redisConnect")
const path=require("path")
const fs=require("fs")
const executeBash=require("../utils/executeBash")
const {fetchFileFromAWSUsingStream}=require("../controllers/fileControllers")
const {listAllFilesOnCloud}=require("../controllers/fileControllers")
async function main(){

    while(true){
        // peek the queue for any id inserted into the queue by the main server
        if(await client.lIndex(process.env.queue,-1))
            {
                // now pop the value that has been inserted into the queue
                const projectId=await client.lPop(process.env.queue)
                //first fetch all the files corresponding to that id
                const data=await listAllFilesOnCloud(projectId)
                // now get the key of all the files
                const keys=data.Contents.map((file)=>{
                  
                  return file.Key
                })
                //now download all the files from the cloud to the build project
                await Promise.all(keys.map(async (key)=>{
                  // first create the folder
                  await executeBash(`mkdir -p ${path.join(process.env.build_output_path,path.dirname(key))}`)
                  // before creating the stream and writing to it we need to manully create the file using the bash
                  const filePath=path.join(process.env.build_output_path,key);
                  await executeBash(`touch ${filePath}`)
                  return  fetchFileFromAWSUsingStream(key,fs.createWriteStream(filePath)).catch((err)=>{
                    throw err
                  })
                }))
                //build the project by first going into the folder then running the npm run build
                await buildReactProject(projectId)
            }
        }
    }
    main()

    // this functin will build the projects by running th git in console
    async function buildReactProject(id) {
      const projectPath = path.join(process.env.build_output_path, id);
    
      try {
        const { error, stdout, stderr } = await executeBash(`
          cd ${projectPath} && npm install && npm run build
        `);
    
        if (error) {
          console.error(`Build error for project ${id}:`, error);
          throw new Error(`Build failed with error: ${error.message}`);
        }
    
        if (stderr) {
          console.warn(`Build stderr for project ${id}:`, stderr);
          
        }
    
        console.log(`Build stdout for project ${id}:`, stdout);
        return stdout;
      } catch (err) {
        console.error(`Exception during build for project ${id}:`, err);
        throw new Error(`Build process failed: ${err.message}`);
      }
    }
    