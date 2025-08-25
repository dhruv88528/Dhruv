import User from "../models/user.js";
import bcrypt from 'bcryptjs';
import transporter from "../config/nodemailer.js";
import crypto from "crypto";
import cloudinary from "../config/cloudinary.js";
import { resolve } from "path";



// for register
export const register = async (req, res) => {
    const {name, email, password} = req.body;

    if(!name || !email || !password || !req.file){
        return res.json({success: false, message: "Missing details"})
    }
    try{
        const existingUser = await User.findOne({email})

        if(existingUser){
            return res.json({success: false, message: "User already exists"});
        }

        const uploadResult = await new Promise((resolve, reject)=> {
            const stream = cloudinary.uploader.upload_stream(
                {folder: "onboarding/profile_images"},
                (error, result) => (error ? reject(error): resolve(result))
            );
            stream.end(req.file.buffer);
        });
         const hashedPassword = await bcrypt.hash(password, 10);
            const verificationCode = crypto.randomBytes(20).toString('hex');
         const user = new userModel({name, email, password: hashedPassword, profileImage: uploadResult.secure_url, isVerified: false, verificationCode});
            await user.save();
         const verifyUrl = `${process.env.APP_BASE_URL}/verify/${verificationCode}`;
         await transporter.sendMail({
            from: process.env.EMAIL_FROM || "No Reply <noreply@example.com>",
            to: user.email,
            subject: "Verify your Email",
            html: `<h2>Email Verification</h2>
             <p>Click below link to verify:</p>
             <a href="${verifyUrl}">${verifyUrl}</a>`,
    });

    res.status(201).json({
      message: "Registered successfully. Please check your email to verify.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

// verify controller
export const verify = async (req, res) => {
  try {
    const { code } = req.params;
    const user = await User.findOne({ verificationCode: code });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ message: "Verification failed" });
  }
};

//  login

export const login = async (req, res)=> {
    try{
        const {email, password} = req.body;
        if(!email || !password){
            return res.json({success: false, message: "Missing details"});
        }

        const user = await User.findOne({email: email.toLowerCase()});
        if(!user){
            return res.json({success: false, message: "User not found"});
        }
        if(!user.isVerified){
            return res.json({success: false, message: "Please Verify your email first"});
        }

        const valid = await bcrypt.compare(password, user.password);
        if(!valid){
            return res.json({success: false, message: "Invalid email or password"});
        }
       res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};