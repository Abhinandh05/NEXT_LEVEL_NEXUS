import express from "express";
import { authenticated, getUserData, getUserProfile, login, logout, register, resetPassword, sendResetOtp, sendVerifyOtp, updateProfile, verifyEmail } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/multer.js";


const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile").get(isAuthenticated, getUserProfile);
router.route("/send-verify-otp").post(isAuthenticated, sendVerifyOtp);
router.route("/verify-account").post(isAuthenticated, verifyEmail);
router.route("/is-auth").get(isAuthenticated, authenticated);
router.route("/send-reset-otp").post(sendResetOtp);
router.route("/reset-password").post(resetPassword);
router.route("/data").get(isAuthenticated, getUserData);



router.route("/profile/update").put(isAuthenticated, upload.single("profilePhoto"), updateProfile);

export default router;