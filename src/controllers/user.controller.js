import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js"
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js";
 
 const registerUser = asyncHandler(async (req, res) => {
    //1. get  user details from frontend
    //2. validation
    //3. check user if already exits: username, email
    //4. check for images , check for avatar 
    //5. upload them in cloudinary, avatar 
    //6. create user object - create enrty in db
    //7. remove password and refresh token field from response 
    //8. check for user creation 
    //9. return response 

    const{fullname,email,username,password} = req.body
    if([fullname,email,username,password].some((field)=>field?.trim()==="")){
      throw new ApiError(400,"All filed are required")
    }
    const existedUser= User.findOne({
      $or:[{username},{password}]
    })

    if(existedUser){
      throw new ApiError(409,"User with email and username alreadt exists");
    }

   const avatarLocalPath = req.files?.avatar[0]?.path;
   const coverImageLocalPath = req.files?.coverImage[0]?.path;

   if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required");
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath);
   const coverImage = await uploadOnCloudinary(coverImageLocalPath);
   if(!avatar){
    throw new ApiError(400,"Avatar file is required");
   }
  const user = await User.create({
      fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url ||"",
      email,
      password,
      username:username.toLowerCase()
   })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering the user");
  }

  return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered Succesfully")
  )

  });

export {registerUser}