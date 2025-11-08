import mongoose,{Schema} from "mongoose";

const likesSchema = new Schema({
    comments:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comments"
    },
    video:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video"
    },
    likedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    tweet:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Tweet"
    }

},{timestamps:true});