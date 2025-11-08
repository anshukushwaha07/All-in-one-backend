import mongoose,{Schema} from "mongoose";

const likesSchema = new Schema({
    comments:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment"
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

const Like = mongoose.model("Like",likesSchema);

export default Like;