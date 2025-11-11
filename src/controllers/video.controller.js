import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary,deleteOnCloudinary} from "../utils/cloudinary.js"


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
    /*

    1. Validate input data (title, description, video file, thumbnail)
    2. Upload video file and thumbnail to Cloudinary
    3. Create a new Video document in the database with the uploaded file URLs and metadata
    4. Return the created video details in the response
    
    */
    if (!(title || description)) {
        throw new ApiError(400, "Title or Description is invalid")
    }

    const videoLocalPath = req.files?.videoFile[0]?.path;
    if (!videoLocalPath) {
        throw new ApiError(400, "Video path is required")
    }

    let thumbnailLocalPath;
    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    }

   const videoFile = await uploadOnCloudinary(videoLocalPath);
   const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

   if (!(videoFile || thumbnail)) {
        throw new ApiError("Error while uploading file on cloudinary")
    }

    const newVideo = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        owner: req.user._id
    });

    return res.status(201).json(
        new ApiResponse(201, newVideo, "Video Published Successfully.")
    );      

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // get video by id
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

   // Increment view count and add to user's watch history atomically
    await promise.all([
        Video.findByIdAndUpdate(videoId, {
            $addToSet: { views: req.user._id }
        }),User.findByIdAndUpdate(req.user._id,{
            $addToSet: { watchHistory: videoId }
        }),])

        const  video = await Video.aggregate([
            {
                $match:{_id:new mongoose.Types.ObjectId(videoId)}
 
            },
            {
                $lookup:{
                    from:"users",
                    localField:"owner",
                    foreignField:"_id",
                    as:"channel"
                }
            },
            {
                $lookup:{
                    from:"comments",
                    localField:"_id",
                    foreignField:"video",
                    as:"comments"
                }
            },
            {
                $lookup:{
                    from:"likes",
                    localField:"_id",
                    foreignField:"video",
                    as:"likes"
                }
            },
            {
                $lookup:{
                    from:"subscriptions",
                    localField: "owner",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },{
                $unwind:"$channel"
            },{
                $addFields:{
                    likesCount: { $size: "$likes" },
                    commentsCount: { $size: "$comments" },
                     views: {
                    $cond: {
                        if: { $isArray: "$views" },
                        then: { $size: "$views" },
                        else: { $ifNull: ["$views", 0] }
                    }
                },
                    "channel.subscribersCount": { $size: "$subscribers" },
                    "channel.isSubscribed": {
                    $cond: {
                        if: { $in: [new mongoose.Types.ObjectId(req.user._id), "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                },
                    isLikedByCurrentUser: {
                        $in: [req.user._id, "$likes.user"]
                    },
                    isSubscribedByCurrentUser: {
                        $in: [req.user._id, "$subscribers.subscriber"]
                    },
                    subscribersCount: { $size: "$subscribers" }
                }
            },{
                $project:{
                "channel._id": 1,
                "channel.avatar": 1,
                "channel.fullName": 1,
                "channel.subscribersCount": 1,
                "channel.username": 1,
                "channel.isSubscribed": 1,

                createdAt: 1,
                description: 1,
                duration: 1,
                likesCount: 1,
                commentsCount: 1,
                views: 1,
                isLikedByCurrentUser: 1,
                isSubscribedByCurrentUser: 1,
                subscribersCount: 1,    
                title: 1,
                videoFile: 1,
                views: 1,
                isPublished: 1
                }
            }
            
        ]);

        return res.status(200).json(
            new ApiResponse(200, video[0], "Video fetched successfully.")
        );
        
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    //1. Validate videoId and input data (title, description, thumbnail)
    //2. If thumbnail is provided, upload it to Cloudinary
    //3. Update the Video document in the database with new details
    //4. delete old thumbnail from cloudinary and Video document on cloudinary
    //5. Return the updated video details in the response

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const { title, description, thumbnail } = req.body;
    const updateData = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;

    if (req.file) {
        // Upload new thumbnail to Cloudinary
        const thumbnailUpload = await uploadOnCloudinary(req.file.path);
        if (!thumbnailUpload) {
            throw new ApiError(500, "Error uploading thumbnail to Cloudinary");
        }
        updateData.thumbnail = thumbnailUpload.url;

        // Optionally, delete old thumbnail from Cloudinary
        const existingVideo = await Video.findById(videoId);
        if (existingVideo && existingVideo.thumbnail) {
            await deleteOnCloudinary(existingVideo.thumbnail);
        }
    }

    const updatedVideo = await Video.findByIdAndUpdate(videoId, updateData, { new: true });
    if (!updatedVideo) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Video updated successfully.")
    );

   

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findByIdAndDelete(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Delete video file and thumbnail from Cloudinary
    await Promise.all([
        deleteOnCloudinary(video.videoFile),
        deleteOnCloudinary(video.thumbnail)
    ]);

    return res.status(200).json(
        new ApiResponse(200, null, "Video deleted successfully.")
    );
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    return res.status(200).json(
        new ApiResponse(200, video, "Video publish status updated successfully.")
    );
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}