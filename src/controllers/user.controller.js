import {asyncHandler} from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiResponce } from "../utils/apiResponse.js"

const generateAccessAndRefreshTokens=async (userId)=>{
    try{
        const user=await User.findById(userId)
        const accessToken=user.generateRefreshToken()
        const refreshToken=user.generateAccessToken()
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
    } catch (error){
        throw new apiError(500,"somthing went wrong while generating access and refresh tokens")
    }
    return {accessToken,refreshToken}
}

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

    const existedUser= await User.findOne({
        $or:[ { username } , { email } ]
    })

    if(existedUser){
        throw new apiError(409,"User with email or username exist")
    }

    const avatarLocalPath= req.files?.avatar[0]?.path;
    //const coverImageLocalPath=req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    if(!avatarLocalPath){
        throw new apiError(400,"avatar file is required")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage= await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new apiError(400,"avatar file is required")
    }

    const user=await User.create({
        fullname,
        avatar: avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new apiError(500,"somthing went wrong while registering the user")
    }

    return res.status(201).json(
        new apiResponce(200,createdUser,"user registered successfully")
    )
    
})

const loginUser = asyncHandler(async(req,res)=>{
    //get user details from frontend
    //validate
    //username or email are there
    //find the user
    //check password
    //access and refresh token generation
    //send secure cookies

    const {email,username,password}=req.body
    if(!username && !email){
        throw new apiError(400,"username or email is required")
    }

    const user=await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new apiError(404,"Use does not exist")
    }

    const isPasswordValid=await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new apiError(401,"Invalid user credentials")
    }

    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)

    const loggeddInUser=await User.findById(user._id).select("-password -refreshToken")
    const options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new apiResponce(200,
            {
                user:loggeddInUser,accessToken,refreshToken
            },
            "User logged in successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
           new:true 
        }
    )
    const options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new apiResponce(200,{},"User logged out"))
})

export default {
    registerUser,
    loginUser,
    logoutUser
}