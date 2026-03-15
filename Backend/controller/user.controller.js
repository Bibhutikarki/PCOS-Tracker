import User from "../models/user.model.js";

export async function getAllUsers(req, res) {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
