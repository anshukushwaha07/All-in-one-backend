import mongoose,{Schema} from "mongoose";

const tweetSchema = new Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    constent:{
        type:String,
        required:true,
        trim:true,
    }
},{timestamps:true});

const Tweet = mongoose.model("Tweet",tweetSchema);

export default Tweet;