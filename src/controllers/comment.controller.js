import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid video ID")
    }
    page = parseInt(page);
    limit = parseInt(limit);
    
    const comments = await Comment.find({video:videoId})
    .skip((page-1)*limit)
    .limit(limit)
    .sort({createdAt:-1});
    
    const totalComments = await Comment.countDocuments({ video: videoId });
    
    const totalPages = Math.ceil(totalComments / limit);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                comments,
                pagination: {
                    page,
                    limit,
                    totalPages,
                    totalComments
                }
            },
            "Comments fetched successfully."
        )
    )
})

const addComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { videoId } = req.params;
    const userId = req.user?._id;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required");
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }

    const comment = await Comment.create({
        content: content.trim(),
        video: videoId,
        owner: userId
    });

    return res.status(201).json(
        new ApiResponse(201, comment, "Comment added successfully")
    );
});


const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
