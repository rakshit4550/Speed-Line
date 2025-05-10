import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found...!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials...!" });

    const token = jwt.sign({ id: user._id }, "54321", { expiresIn: "1d" });

    res.cookie("user_token", token, {
      httpOnly: true, 
      secure: false,  
      sameSite: "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, message: "Login successfully...!", token });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

export const userLogout = async (req, res) => {
  try {
    res.clearCookie("user_token", { httpOnly: true, secure: false, sameSite: "Lax" });

    res.json({ success: true, message: "Logout successfully...!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error while logging out...!", error });
  }
};
