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
  
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
   
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}