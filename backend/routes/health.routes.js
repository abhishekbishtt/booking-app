const express=require('express');
const router=express.Router();
const{testConnection,getPoolStatus}=require('../models/db');


router.get('/',(req,res)=>{
    //no try catch required here as it makes no sense if our app is not working we wont get any response
//we can use it in finding externam dependencies


    res.status(200).json({
        message:"App is running",
        status:'healthy',
        service: 'Movie Booking API',
        timestamp: new Date().toISOString() 
    })


})

router.get('/db',async (req,res)=>{
    try{

        const ans= await testConnection();
        if(!ans){
            return res.status(503).json({
                message:"error in connecting to db",
                status:'unhealthy',
                timestamp: new Date().toISOString() 
                
            })
        }
        else{
            return res.status(200).json({
                message:"db connected",
                status:'healthy',
                timestamp: new Date().toISOString() 

                
            })
        }
    }
catch(error){
 console.error("error :",error);
 return res.status(503).json({
    message:"Database connection failed",
    status:'unhealthy',
    error: error.message,
    timestamp: new Date().toISOString() 
 })
}
})

router.get('/pool',(req,res)=>{
const status=getPoolStatus();

if(status.error){
    console.error('Pool health check failed',status.details)
    return res.status(503).json({
        status:'unhealthy',
        message:status.details,
        timestamp: new Date().toISOString()
    })
}
else{
return res.status(200).json({
    message:"pool working properly",
    status:'healthy',
    pool:status, //also adding full status object for indepth analysis
    timestamp: new Date().toISOString() 

})

}
})
module.exports = router;

