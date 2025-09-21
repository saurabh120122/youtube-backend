import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"
const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if (
        [name, description].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    const existedPlaylist=await Playlist.findOne({
        name,
        owner:req.user._id
    })
    if(existedPlaylist){
        throw new ApiError(409,"Playlist with this name already exist.")
    }
    const playlist=await Playlist.create({
        name,
        description,
        owner:req.user._id
    })
    if(!playlist){
        throw new ApiError(500,"Something went wrong while creating Playlist")
    }
    return res.status(201).json(
        new ApiResponse(201, playlist, "Playlist created Successfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid User ID");
    }
    const playlists=await Playlist.find({owner:userId})
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlists,
            "Playlists fetched successfully"
        )
    )
    
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID");
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "fetched playlist successfully"
        )
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID");
    }
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if (playlist.videos.includes(videoId)) {
        return res
            .status(200)
            .json(new ApiResponse(200, playlist, "Video is already in the playlist"));
    }
    playlist.videos.push(videoId)
    const updatedPlaylist = await playlist.save()
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "Video added to playlist successfully"
        )
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID");
    }
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if (!playlist.videos.includes(videoId)) {
        throw new ApiError(404,"Video not found in Playlist")
    }
    const videoIdIndex=playlist.videos.indexOf(videoId)
    playlist.videos.splice(videoIdIndex,1)
    const updatedPlaylist=await playlist.save();
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "Video removed from playlist succsessfully"
        )
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID");
    }
    const deletedPlaylist=await Playlist.findByIdAndDelete(playlistId)
    if(!deletedPlaylist){
        throw new ApiError(404,"Playlsit not found")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            null,
            "PlayList deleted successfully"
        )
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID");
    }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }
    if (name !== undefined ){
        if(name.trim()===""){
            throw new ApiError(400,"Playlist can not be empty")
        }
        playlist.name = name
    } 
    if (description !== undefined) playlist.description = description
    const updatedPlaylist=await playlist.save();
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "Playlistupdated Successfully"
        )
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
