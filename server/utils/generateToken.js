import jwt from "jsonwebtoken";

export const generateToken = (res, user, message) => {
  const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
    expiresIn: "1d",
  });

  return res
    .cookie("token", token, {
      httpOnly: true,
      secure: true,           // Needed for HTTPS (e.g., Render)
      sameSite: "None",       // Needed for cross-site cookies
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    })
    .status(200)
    .json({
      success: true,
      message: message || `Welcome back ${user.fullName}`,
      user,
    });
};
