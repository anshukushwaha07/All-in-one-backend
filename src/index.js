import dotenv from 'dotenv'
dotenv.config(); 
import connectDB from './db/db.js';
import { app } from "./app.js";

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8080,()=>{
        console.log(`Server is running at port ${process.env.PORT}`)
    })
    app.on('error',(error)=>{
        console.log("ERROR:",error);
        throw error
    })
})
.catch((err)=>{
    console.log("Mongo db connection failed !!! ",err)
})

/*

// using iff function 
import  express  from "express";
const app=express();
(async()=>{

    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on('error',(error)=>{
            console.log("ERROR:",error);
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    }catch(error){
        console.error('ERROR: ',error)
        throw err
    }

})()

*/