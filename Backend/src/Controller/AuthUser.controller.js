const User = require("../Models/user.model.js");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

module.exports.RegisterUser = async (req, res) => {
  const { name, email, phone, password, conformpassword } = req.body;
  try {
    if (!name || !email || !password || !conformpassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== conformpassword) {
      return res
        .status(400)
        .json({ message: "Password and Conform Password do not match" });
    }

    if(password.length < 6){
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      isVerified: true
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email},
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "production", // true if using HTTPS
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.log("Error in RegisterUser controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const otpStore = {};

module.exports.SendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const otp = (Math.floor(100000 + Math.random() * 900000))
  otpStore[email] =otp;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "RoomRent - Email Verification OTP",
      text: `Your OTP for email verification is ${otp}. It will expire in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.log("Error in SendOtp controller", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

module.exports.VerifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }
    if(!otpStore[email] || otpStore[email] != otp){
      return res.status(400).json({ message: "Invalid OTP" });
    }
    delete otpStore[email];
    const user = await User.findOne({email});
    // const role = user.role === "admin" ? "admin" : "user";
    if(user){
      const token = jwt.sign(
      { id: user._id, role: user.role},
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "production", // true if using HTTPS
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(200).json({
      success: true,
      login: true,
      message: "OTP verified! Login successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    })
    }
    
    
    res.status(200).json({
      success: true,
      isVer: true,
      message: "OTP verified! Register successfully",
      email
    })
  }

module.exports.LoginUser = async (req, res) =>{

  const {email, password} = req.body;

  try{
    if(!email || !password){
      return res.status(400).json({message: "All fields are required"});
    }
    const user  = await User.findOne({email});
    if(!user){
      return res.status(404).json({message: "Invalid email or password"});
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if(!isPasswordMatch){
      return res.status(404).json({message: "Invalid email or password"});
    }

    const role = user.role === "admin" ? "admin" : "user";

    const token = jwt.sign(
      {id:user._id, role: role},
      process.env.JWT_SECRET,
      {expiresIn: "7d"}
    
    )

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "production", // true if using HTTPS
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    if(role === "admin"){
      return res.status(200).json({
        message: "Admin logged in successfully",
        token, 
        role: "admin",
        user
      });
    }else{
      res.status(200).json({
        message: "User logged in successfully",
        role: "user", 
        user
      });
    }
  }catch(error){
    res.status(500).json({message: "Internal Server Error"});
  }

}

module.exports.LogOutUser = async (req, res) =>{
  const token = req.cookies.token;
  if(!token){
    return res.status(400).json({message: "User is not logged in"});
  }

  try{
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "production", // true in production
      sameSite: "lax",
    })
    res.status(200).json({
      success: true,
      message: "User logged out successfully"

    });
  }catch(error){
    res.status(500).json({message: "Internal Server Error"});
  }
}

module.exports.LoginStatus = async (req, res) =>{
  const token = req.cookies.token;
  if(!token){
    return  res.status(200).json({login: false , message: "User is not logged in"});
  }
  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let role = "";
    let userData = null;
    const user = await User.findById(decoded.id);
    if(user){
      role = user.role,
      userData = user
    }

    if(!role){
      return res.status(200).json({login: false , message: "User is not logged in"});
    }

    res.status(200).json({
            login: true,
            role: role,
            message: "User is logged in",
            user :{ id: decoded.id, email: userData.email }
        })
  }catch(error){
    res.status(500).json({login:false,message: "Internal Server Error"});
  }

}