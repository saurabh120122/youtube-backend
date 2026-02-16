import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400,"Invalid USer ID")
    }
    const videos= await Video.aggregate([
        {
            $match:{
                owner:userId
            }
        }
    ])

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
    const thumbnailLocalPath = req.files?.thumbnail[0].path
    if(!thumbnailLocalPath){
        throw new ApiError(400,"Thumbnai is required")
    }

    const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if(!uploadedThumbnail){
        throw new ApiError(500,"Failed to upload thumbnail")
    }
    const video = await Video.create({
        title,
        description,
        videoFile:uplodedVideo.url,
        owner:req.user?._id,
        thumbnail:uploadedThumbnail.url,
        duration:uplodedVideo.duration,
        isPublished:true,
        thumbnailPublicId:uploadedThumbnail.public_id,
        videoPublicId:uplodedVideo.public_id
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
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video Id")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.thumbnailPublicId) {
        await deleteFromCloudinary(video.thumbnailPublicId, "image")
    }
    if (video.videoPublicId) {
        await deleteFromCloudinary(video.videoPublicId, "video")
    }

    await video.deleteOne()

    return res.status(200).json(
        new ApiResponse(200, video, "Video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video Id")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not found")
    }
    video.isPublished=!video.isPublished
    await video.save()
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Toggled successfully"
        )
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
