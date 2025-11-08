import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

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

CommentsSchema.plugin(mongooseAggregatePaginate);

const Comment = mongoose.model("Comment",CommentsSchema);

export default Comment;