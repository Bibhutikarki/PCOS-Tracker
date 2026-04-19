import User from "../models/user.model.js";
export async function getAllUsers(req, res) {
    try{
        const users = await User.find({}, '-password'); // excludes password
        res.status(200).json({users});
    }catch(e){
        return res.status(500).send(e);
    }

}

export async function updateUserSettings(req, res) {
    try {
        const { id } = req.params;
        const { workoutReminderTime, workoutReminderEnabled, height, weight } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { workoutReminderTime, workoutReminderEnabled, height, weight },
            { new: true, runValidators: true, select: '-password' }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user: updatedUser });
    } catch (e) {
        return res.status(500).json({ message: e.message || "An error occurred while updating settings" });
    }
}