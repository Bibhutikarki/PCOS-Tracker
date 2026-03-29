import User from "../models/user.model.js";
export async function getAllUsers(req, res) {
    try{
        const users = await User.find({}, '-password'); // excludes password
        res.status(200).json({users});
    }catch(e){
        return res.status(500).send(e);
    }

}