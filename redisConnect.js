const {createClient}=require('redis')
const client=createClient({
    url: process.env.REDIS_HOST, 
  })


  
  client.on('error', (err) => {
    console.error(`\x1b[31m❌ Redis Client Error:\x1b[0m \x1b[34m${err.message}\x1b[0m`);
  });
  
  client.on('connect', () => {
    console.log(process.env.REDIS_HOST)
    console.log(`\x1b[32m✅ Connected to Redis\x1b[0m at \x1b[34m${process.env.REDIS_HOST}\x1b[0m`);
  });
  
  client.connect();
  module.exports=client