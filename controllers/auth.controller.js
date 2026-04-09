import cloudnary from "../lib/cloudnary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcyrpt from "bcryptjs";

const Signup = async (req, res) => {
  const { email, fullname, password } = req.body;
  try {
    if (!email || !fullname || !password) {
      console.log(email+" "+fullname+ " "+password)
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be of 6 digits" });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const salt = await bcyrpt.genSalt(10);

    const hashpassword = await bcyrpt.hash(password, salt);

    const newUser = new User({
      fullname,
      email,
      password: hashpassword,
    });

    if (newUser) {
      // generate Token
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      return res.status(400).json({ message: "Invalid user data " });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
  }
};
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid crediatials" });
    }

    const ispassword = await bcyrpt.compare(password, user.password);
    if (!ispassword) {
      return res.status(400).json({ message: "Invalid crediatials" });
    }

    generateToken(user._id, res);
    res.status(201).json({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxage: 0 });
    return res.status(200).json({ message: "Logout sucessfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const UpdateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;
    if (!profilePic) {
      return res.status(400).json({ message: "Profile photo is required " });
    }
    const uploadedUser = await cloudnary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadedUser.secure_url },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in UpdateProfile controller", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const checkAuth = (req, res) => {
  try {
    console.log(req.user);
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { Signup, logout, login, UpdateProfile, checkAuth };
