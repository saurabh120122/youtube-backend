import { apiError } from "../utils/apiError"
import { asyncHandler } from "../utils/asyncHandler"
import jwt from "jsonwebtoken"
import { JsonWebTokenError } from "jsonwebtoken"
import { User } from "../models/user.model" 
export const verifyJwt=asyncHandler(async(req,res,next)=>{
    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Brarer ","")
    if(!token){
        throw new apiError(401,"Unauthoized request")
    }
    const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    if(!user){
        throw new apiError(401,"Invalid Access Token")
    }
    req.user=user;
    next()
    } catch (error) {
        throw new apiError(401,error?.message||"Invalid access token")
    }

})