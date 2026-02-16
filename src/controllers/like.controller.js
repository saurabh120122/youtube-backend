import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models.js"
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video Id");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(403, "Unauthorized Access");
    }

    const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

    if (!existingLike) {
        await Like.create({ video: videoId, likedBy: userId });
        return res.status(200).json(
            new ApiResponse(200, { liked: true }, "Video liked successfully")
        );
    } else {
        await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json(
            new ApiResponse(200, { liked: false }, "Video unliked successfully")
        );
    }
})


const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(403, "Unauthorized request");
    }

    const likes = await Like.find({ likedBy: userId, video: { $ne: null } })
                            .populate("video");
                            
    const videos = likes.map(like => like.video);

    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "Fetched all liked videos successfully"
        )
    );
});


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}