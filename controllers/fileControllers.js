const {S3Client,PutObjectCommand,ListObjectsV2Command,GetObjectCommand}=require("@aws-sdk/client-s3")
const {getSignedUrl}=require("@aws-sdk/s3-request-presigner")
const multer=require("multer")
const path = require('path');
const { pipeline } = require("stream");
const { Upload } = require('@aws-sdk/lib-storage');
const fs = require('fs');

// creating the client object
const client=new S3Client({
    region:"ap-south-1",
    credentials:{
      accessKeyId:process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY
    }
}) 
// getting the predefined url
const getObjectUrl=async function getObjectUrl( key) {
    const command = new GetObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: key });
    const url=await getSignedUrl(client, command, { expiresIn: 14 * 60 * 60  })
    return url
}
// uploading the object then returning the signed  url
const putObjectCommand=async function putObjectCommand({filepath,filename,content_type}){
    const command=new PutObjectCommand({Bucket:process.env.AWS_BUCKET_NAME,Key:`${filepath}/${filename}`,ContentType:content_type})
    const url =getSignedUrl(client,command,{expiresIn:14*60*60});
    return url

}




const uploadS3 = async (Key, localFilePath) => {
  try {
    const fileStream = fs.createReadStream(localFilePath);

    const upload = new Upload({
      client,
      params: {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key,
        Body: fileStream,
      },
      queueSize: 4,
      partSize: 5 * 1024 * 1024, // 5MB
      leavePartsOnError: false,
    });

    const result = await upload.done();
    console.log('Upload Success:', result.Location);
    return result.Location;
  } catch (e) {
    console.error('Upload Failed:', e);
    throw e;
  }
};

async function listAllFilesOnCloud(id){
  const listCommands=new ListObjectsV2Command({
    Bucket:process.env.AWS_BUCKET_NAME,
    prefix:id
  })
  const data=await client.send(listCommands)
  return data
}
// this controller will stream the data from the aws to the given ouotput wether its system disk or to reponse to client
async function fetchFileFromAWSUsingStream(file, dest) {
  try {
    const cmd = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: file, // assuming 'file' is the key
    });

    const response = await client.send(cmd);
    const S3stream = response.Body;

    // Pipe S3 stream to the destination stream
    await pipe(S3stream, dest);
    console.log('✅ File streamed successfully from S3');
  } catch (err) {
    console.log(file)
    console.error('❌ Error while streaming file from S3:', err.message);
 
    throw err;
  }
}
//converting the asynchronous function pipline to promise based
async function pipe(srcSream,destStream){
  await new Promise((resolve,reject)=>{
    pipeline(srcSream,destStream,(err)=>{
      if(err)
      return  reject(err)
      return resolve(true)
    })
  })
}
module.exports = {
  uploadS3,
  putObjectCommand,
  getObjectUrl,
  listAllFilesOnCloud,
  fetchFileFromAWSUsingStream
};