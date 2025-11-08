import mongoose,{Schema} from "mongoose";

const CommentsSchema = new Schema({
    content:{
        type:String,
        required:true,
        trim:true,
    },
    video:{
        type:mongoose.Schema.Types.ObjectId, //the video on which comment is made
        ref:"Video"
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true});

const Comments = mongoose.model("Comments",CommentsSchema);

export default Comments;