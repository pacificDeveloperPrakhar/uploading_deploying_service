const dotenv = require("dotenv");
dotenv.config({ path: "../config.env" });
const client=require("../redisConnect")
async function myfunc(){

    while(true){
        // peek the queue for any id inserted into the queue by the main server
        if(await client.lIndex(process.env.queue,-1))
            {
                // now pop the value that has been inserted into the queue
                const value=await client.lPop(process.env.queue)
                console.log(value)
            }
        }
    }
    myfunc()