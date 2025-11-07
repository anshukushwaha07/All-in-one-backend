import mongoose ,{Schema} from "mongoose";

const subscriptionSchema = new Schema({
  subscriber:{
    type: mongoose.Schema.Types.ObjectId, //One who subscribing 
    ref: "User",
  },
  channel:{
    type: mongoose.Schema.Types.ObjectId, //One to whom subscriber is subscribing
    ref: "User",
  },
},
{
  timestamps:true,
  }
); 

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;