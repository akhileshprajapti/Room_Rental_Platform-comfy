const mongoose = require("mongoose")
const Schema = mongoose.Schema

const userSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type: String,
        required:true,
        unique:true
    },
    phone:{
        type : Number,

    },
    password:{
        type: String,
        required: true,
    },
    
    isVerified:{
        type: Boolean,
        default: false
    },
    verificationCode:{
        type: String,
    },
    role:{
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }
},
  {
    timestamps: true
  }
)

const User = mongoose.models.User || mongoose.model("User", userSchema)

module.exports = User;