import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    //1. validate request body  
    //2. create tweet in db
    //3. return response

    const { content } = req.body
    if (!content) {
        throw new ApiError(400, "Content is required")
    }

    const newTweet = await Tweet.create({
        content,
        owner: req.user._id
    })

    return res.status(201).json(
        new ApiResponse(201, newTweet, "Tweet Created Successfully.")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const userId = req.user._id
     const tweets = await User.aggregate([
        {
            $match: {_id: new mongoose.Types.ObjectId(userId)}
        },
        {
            $lookup: {
                from: "tweets",
                localField: "_id",
                foreignField: "owner",
                as: "tweets"
            }
        },
        {
            $unwind: "$tweets"
        },
        {
            $lookup:{
                from:"likes",
                let: { tweetId: "$tweets._id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$tweet", "$$tweetId"] } } },
                    { $count: "count" }
                ],
                as: "likesCount"
            }
        },{
            $addFields:{
                "tweets.likesCount": { $arrayElemAt: ["$likesCount.count", 0] }
            }
        },{
            $group:{
                _id:"$_id",
                 fullName: { $first: "$fullName" },
                username: { $first: "$username" },
                email: { $first: "$email" },
                avatar: { $first: "$avatar" },
                tweets: { $push: "$tweets" }
            }
        },{
            $project:{
                _id:1,
                fullName:1,
                username:1,
                email:1,
                avatar:1,
                tweets:1
            }       
        }
    ])
    return res.status(200).json(new ApiResponse(200, tweets, "User Tweets fetched successfully"))    
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const { content } = req.body

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    //check if the logged in user is the owner of the tweet
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet")
    }

    tweet.content = content || tweet.content
    await tweet.save()

    return res.status(200).json(new ApiResponse(200, tweet, "Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    //check if the logged in user is the owner of the tweet
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet")
    }

    await tweet.remove()

    return res.status(200).json(new ApiResponse(200, null, "Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}