import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    if (
        [title, description].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    const videoLocalPath = req.files?.video[0]?.path;
    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required")
    }
    const uplodedVideo = await uploadOnCloudinary(videoLocalPath)
    if(!uplodedVideo){
        throw new ApiError(500,"Failed to upload video")
    }
    const video = await Video.create({
        title,
        description,
        videoFile:uplodedVideo.url,
        owner:req.user?._id
    })
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Video Published Successfully"
        )
    )
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully"));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const { title, description } = req.body
    if ([title, description].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    let thumbnailUrl
    if (req.file?.path) {
        const thumbnail = await uploadOnCloudinary(req.file.path)
        if (!thumbnail) {
            throw new ApiError(400, "Error while uploading thumbnail to Cloudinary")
        }
        thumbnailUrl = thumbnail.url
    }

    const updateFields = {
        title,
        description,
    }
    if (thumbnailUrl) updateFields.thumbnail = thumbnailUrl

    const video = await Video.findByIdAndUpdate(
        videoId,
        { $set: updateFields },
        { new: true }
    )

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Video details updated successfully")
    )
})


const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
