const {getPoolStatus,testConnection}=require('./models/db');
const { sequelize } = require('./models');
const testPool=async()=>{

  console.log("testing  pooling ");

  await testConnection(); 

  //check initial pool status
  console.log("Initial pool status:",getPoolStatus());

  //
const promise=[];

for(let i=0;i<3;i++){
  promise.push(
    sequelize.query('SELECT NOW() as current_time')
  );

}


await Promise.all(promise);
console.log(' Pool status after queries:', getPoolStatus());


}
module.exports=testPool;