import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
  
    // TODO: get all videos based on query, sort, pagination
    // TODO: Retrieve all videos with optional filtering by 'query' (search term), sorting by 'sortBy' and 'sortType', pagination using 'page' and 'limit', and filtering by 'userId'.
    // Expected query parameters: page (number), limit (number), query (string), sortBy (string), sortType ('asc'|'desc'), userId (string).
    // Response: JSON object with 'videos' (array), 'total' (number), 'page' (number), and 'limit' (number).
    
    const pageNumber = parseInt(page); 
    const limitNumber = parseInt(limit);
    const sortDirection = sortType === "asc" ? 1 : -1;
    const matchStage = query ? { title: { $regex: query, $options: "i" } } : {};
    const sortStage = { [sortBy]: sortDirection, };
    if (userId && isValidObjectId(userId)) {
        matchStage.owner = new mongoose.Types.ObjectId(userId);
    }

   const aggregatePipeline = [
        { $match: matchStage },
        { $sort: sortStage },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "channel"
            }
        },
        {
            $unwind: "$channel",
        },
        {
            $project: {
                _id: 1,
                thumbnail: 1,
                title: 1,
                duration: 1,
                views: {
                    $cond: {
                        if: { $isArray: "$views" },
                        then: { $size: "$views" },
                        else: { $ifNull: ["$views", 0] }
                    }
                },
                isPublished: 1,
                "channel._id": 1,
                "channel.username": 1,
                "channel.avatar": 1,
                createdAt: 1,
                updatedAt: 1
            }
        }
    ];

    const options = {
        page: pageNumber,
        limit: limitNumber,
    };


    const aggregate = Video.aggregate(aggregatePipeline);

    Video.aggregatePaginate(aggregate, options, (err, result) => {
        if (err) {
            throw new ApiError(400, err.message || "Failed to fetch videos");
        } else {
            return res.status(200).json(
                new ApiResponse(200, result, "All Videos Fetched Successfully.")
            );
        }
    });

})
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const cloudinaryResult = await uploadOnCloudinary(req.file.path);
    if (!cloudinaryResult) {
        throw new ApiError(500, "Failed to upload video");
    }

    const newVideo = new Video({
        title,
        description,
        videoUrl: cloudinaryResult.secure_url,
        thumbnail: cloudinaryResult.thumbnail,
        owner: req.user._id
    });

    await newVideo.save();
    res.status(201).json(new ApiResponse(201, newVideo, "Video published successfully"));
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
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