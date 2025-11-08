import mongoose,{Schema} from "mongoose";
const commentSchema = new Schema({
   
     name:{
        type:String,
        required:true,
        trim:true,
    },
    discription:{
        type:String,
        trim:true,
    },
    videos:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video"
    }],
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }

},{timestamps:true});

const Playlist = mongoose.model("Playlist",commentSchema);

export default Playlist;