import {asyncHandler} from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiResponce } from "../utils/apiResponse.js"
const registerUser = asyncHandler(async(req,res)=>{
    //get user details from frontend
    //validation - not empty
    //check if user already exist
    //check for images and check for avtars
    //upload them to cloudnary
    //create user object - create entry in db
    //remove password and refresh token feild from responce
    //check for user creation 
    //return res
    const {fullname,email,username,password}=req.body

    if(
        [fullname,email,username,password].some((field)=>
            field?.trim==="")
    ) {
        throw new apiError(400,"All feilds are required")
    }

    const existedUser=User.findOne({
        $or:[ { username } , { email } ]
    })

    if(existedUser){
        throw new apiError(409,"User with email or username exist")
    }

    const avatarLocalPath= req.files?.avatar[0]?.path;
    const coverImageLoacalPath=req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new apiError(400,"avatar fiel is required")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage= await uploadOnCloudinary(coverImageLoacalPath)
    if(!avatar){
        throw new apiError(400,"avatar fiel is required")
    }

    const user=await User.create({
        fullname,
        avatar: avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser = await User.findById(user_id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new apiError(500,"somthing went wrong while registering the user")
    }

    return res.status(201).json(
        new apiResponce(200,createdUser,"user registered successfully")
    )
    
})

export default registerUser