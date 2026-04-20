const { string } = require("joi");
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
        type: String,
        required: true,
        validate: {
            validator: function (v) {
            return /^[0-9]{10}$/.test(v)
    },
        message: "Phone number must be exactly 10 digits",

    },
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
    },
     resetOtp: {
        type: String
    },
    resetOtpExpiry: {
        type: Date
    },
},
  {
    timestamps: true
  }
)

const User = mongoose.models.User || mongoose.model("User", userSchema)

module.exports = User;