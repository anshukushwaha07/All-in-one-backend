// import {v2 as cloudinary} from "cloudinary"
// import fs from "fs"

// cloudinary.config({ 
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//     api_key: process.env.CLOUDINARY_API_KEY, 
//     api_secret: process.env.CLOUDINARY_API_SECRET,
//   });

//   const uploadOnCloudinary = async (localFilePath) =>{
//     try{
//         if(!localFilePath) return null
//         //Upload file in cloudinary

//         console.log("From cloudinary.js API KEY:", process.env.CLOUDINARY_API_KEY);
//         console.log("From cloudinary.js CLOUD NAME:", process.env.CLOUDINARY_CLOUD_NAME);
//         console.log("From cloudinary.js: API SECRET", process.env.CLOUDINARY_API_SECRET);

//      const response = await cloudinary.uploader.upload
//      (localFilePath,{
//             resource_type:"auto"
//         })
//         //file hab been  uploaded successfull
//         console.log("file is uploded on cloudinary",response.url)
//         return response
//     }catch(error){
//         fs.unlinkSync(localFilePath)//remove the locally save temporary files as the operation got failed
//         return null;
//     }
//   }
  
//   export {uploadOnCloudinary}



import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./apiError.js";
import { extractPublicId } from "cloudinary-build-url";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  // We removed the console.logs as we know they work.

  if (!localFilePath) return null;

          console.log("From cloudinary.js API KEY:", process.env.CLOUDINARY_API_KEY);
        console.log("From cloudinary.js CLOUD NAME:", process.env.CLOUDINARY_CLOUD_NAME);
        console.log("From cloudinary.js: API SECRET", process.env.CLOUDINARY_API_SECRET);


  //
  // NO TRY...CATCH BLOCK HERE!
  //
  // We let the error throw so the asyncHandler can catch it.
  //

  // Upload the file to Cloudinary
  const response = await cloudinary.uploader.upload(localFilePath, {
    resource_type: "auto",
  });

  // File has been uploaded, so now we delete the local copy
  fs.unlinkSync(localFilePath);

  console.log("File is uploaded on Cloudinary:", response.url);
  return response;
};

const deleteOnCloudinary = async (image) => {
    try {
        if (!image) {
            throw new ApiError(404, "Image Invalid")
        }
        //delete the file on cloudinary
        const publicId = extractPublicId(image);

        const response = await cloudinary.uploader.destroy(publicId);
        if(response.result != 'ok'){
            throw new ApiError(404, "Old Image Deletion Failed from Cloudinary")
        }

        // file has been deleted successfully
        return 1;

    } catch (error) {
        return null;
    }
}

export { uploadOnCloudinary, deleteOnCloudinary };