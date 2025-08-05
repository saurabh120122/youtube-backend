import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: CLOUDINARY_API_KEY, 
        api_secret: CLOUDINARY_API_SECRET
});
const uploadOnCloudinary = async(localFilePath) =>{
        try{
             if(!localFilePath)return null;
             //upload thel file on cloudinary
             const response=await cloudinary.uploader.upload(localFilePath,{
                resource_type:"auto"
             })
             //file ahs been uploaded successfully
             console.log("file is uploaded on cloudinary",response.url);
             return response;
        } catch (error){
                fs.unlinkSync(localFilePath) //remove the file
                return null;
        }
}
export {uploadOnCloudinary}