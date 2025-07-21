module.exports=function(){
    seed=process.env.id_seed
    let result=""
    for(let i=0;i<seed.length;i++){
     result+=seed[Math.floor(Math.random()*seed.length)];
    }
    return result
}