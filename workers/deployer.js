const dotenv = require("dotenv");
dotenv.config({ path: "../config.env" });
const client=require("../redisConnect")
const path=require("path")
const executeBash=require("../utils/executeBash")
async function main(){

    while(true){
        // peek the queue for any id inserted into the queue by the main server
        if(await client.lIndex(process.env.queue,-1))
            {
                // now pop the value that has been inserted into the queue
                const projectId=await client.lPop(process.env.queue)
                await buildReactProject(projectId)
            }
        }
    }
    main()
    //fetching the files form the aws s3 bucket

    // this functin will build the projects
    async function buildReactProject(id) {
      const projectPath = path.join(process.env.clone_output_path, id);
    
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
    