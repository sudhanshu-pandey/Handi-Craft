import User from "../models/user.model.js";
import { HTTP_STATUS } from "../config/constants.js";

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-otp -otpExpires -refreshTokens");
    if (!user) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: err.message });
  }
};


// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, gender, dob } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "User not found" });
    if (name) user.name = name;
    if (email) user.email = email;
    if (gender) user.gender = gender;
    if (dob) user.dob = dob;
    await user.save();
    res.json({ user });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: err.message });
  }
};

// Add address
const addAddress = async (req, res) => {
  try {
    const address = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "User not found" });
    user.addresses.push(address);
    await user.save();
    res.status(HTTP_STATUS.CREATED).json({ addresses: user.addresses });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: err.message });
  }
};

// Update address
const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const update = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "User not found" });
    const addr = user.addresses.id(addressId);
    if (!addr) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Address not found" });
    Object.assign(addr, update);
    await user.save();
    res.json({ addresses: user.addresses });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: err.message });
  }
};

// Delete address
const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
    await user.save();
    res.json({ addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// List addresses
const listAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export default {
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  listAddresses
};
