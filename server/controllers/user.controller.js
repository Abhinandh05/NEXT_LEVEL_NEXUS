import {User} from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import transporter from "../config/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from "../config/emailTemplates.js";
import { EMAIL_WELCOME_TEMPLATE } from "../config/emailSecondTemplates.js";
import userModel from "../models/user.model.js";

// import jwt from "jsonwebtoken";
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists with this email." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, email, password: hashedPassword });

        // Sending welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject:` Welcome to My Website, ${name}`,
            html: EMAIL_WELCOME_TEMPLATE.replace("{{name}}", name).replace("{{email}}", email),
        };

        await transporter.sendMail(mailOptions);

        return res.status(201).json({ success: true, message: "Account created successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to register" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ success: false, message: "Incorrect email or password" });
        }

        generateToken(res, user, `Welcome back ${user.name}`);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to login" });
    }
};
export const logout = async (_, res) => {
    try {
        return res.status(200).clearCookie("token").json({ success: true, message: "Logged out successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to logout" });
    }
};
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).select("-password").populate("enrolledCourses");
        if (!user) {
            return res.status(404).json({ success: false, message: "Profile not found" });
        }
        return res.status(200).json({ success: true, user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to load user" });
    }
};
export const updateProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { name } = req.body;
        const profilePhoto = req.file;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.photoUrl) {
            const publicId = user.photoUrl.split("/").pop().split(".")[0];
            deleteMediaFromCloudinary(publicId);
        }

        const cloudResponse = await uploadMedia(profilePhoto.path);
        const updatedUser = await User.findByIdAndUpdate(userId, { name, photoUrl: cloudResponse.secure_url }, { new: true }).select("-password");

        return res.status(200).json({ success: true, user: updatedUser, message: "Profile updated successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to update profile" });
    }
};

export const sendVerifyOtp = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(400).json({ message: "User not found", success: false });
        }

        if (user.isAccountVerified) {
            return res.status(400).json({ message: "Account already verified", success: false });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit OTP

        user.verifyOtp = otp;
        user.verifyOtpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

        await user.save();

        // Send OTP email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Verify Your Account",
            // text: `Your verification code is: ${otp}. Please verify your account using this OTP.`,
            html:EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
        };

        await transporter.sendMail(mailOptions);

        return res.json({ message: "Verification code sent successfully", success: true });
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
};

export const verifyEmail = async (req, res) => {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
        return res.status(400).json({ message: "All fields are required", success: false });
    }

    try {
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(400).json({ message: "User not found", success: false });
        }

        if (user.verifyOtp !== String(otp)) {
            return res.status(400).json({ message: "Invalid OTP", success: false });
        }

        if (user.verifyOtpExpiresAt < Date.now()) {
            return res.status(400).json({ message: "OTP expired", success: false });
        }

        user.isAccountVerified = true;
        user.verifyOtp = "";
        user.verifyOtpExpiresAt = 0;

        await user.save();
        return res.json({ message: "Email verified successfully", success: true });
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
};

// USER IS AUTHENTICATED

export const authenticated = async (req, res) => {
    try {
        return res.json({ message: "User is authenticated", success: true });

    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
}

// Send password reset otp

export const sendResetOtp = async (req, res) =>{
    const {email } = req.body
    if(!email){
        return res.status(400).json({message: "Email is required", success: false})
    }

    try {

        const user = await userModel.findOne({email})
        if(!user){
            return res.status(400).json({message: "User not found", success: false})
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit OTP

        user.resetOtp = otp;
        user.resetOtpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

        await user.save();

        // Send OTP email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Reset Your Password",
            // text: `Your reset code is: ${otp}. Please reset your password using this OTP.`,
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
        };

        await transporter.sendMail(mailOptions);
        return res.json({message: "OTP sent successfully", success: true})
        
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
}

// Reset password

export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: "All fields are required", success: false });
    }

    try {
        // Corrected: Use findOne instead of findById
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User not found", success: false });
        }

        if (!user.resetOtp || user.resetOtp !== String(otp)) {
            return res.status(400).json({ message: "Invalid OTP", success: false });
        }

        if (user.resetOtpExpiresAt < Date.now()) {
            return res.status(400).json({ message: "OTP expired", success: false });
        }

        // Corrected: Hash new password properly
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password
        user.password = hashedPassword;
        user.resetOtp = "";
        user.resetOtpExpiresAt = null;

        await user.save();

        return res.json({ message: "Password reset successfully", success: true });

    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
};

export const getUserData = async (req, res) => {
    try {
        const userId = req.user?.id; // Extract userId from authenticated user

        if (!userId) {
            return res.status(400).json({ message: "User ID is required", success: false });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        res.status(200).json({
            success: true,
            userData: {
                name: user.name,
                email: user.email,
                isAccountVerified: user.isAccountVerified,
            },
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error", success: false });
    }
};
