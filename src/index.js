//require('dotenv').config({path:'./env'})
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from './app.js'
dotenv.config({
    path:'./env'
})
connectDB()
.then(()=> {
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Database connected successfully and running at ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.error("Error connecting to the database:", error);
    process.exit(1);
});
/*(async()=>{
    try {
        await mongoose.connect('${process.env.MONGO_URI}/${DB_NAME}')
        app.on("error",(error)=>{
            console.log("Error:",error);
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log('App is listening on port ${process.env.PORT}')
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error
    }
})()*/