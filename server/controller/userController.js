import userModel from "../models/userModel.js";

export const searchUsers = async (req, res) => {
  try {
    let { query } = req.body;

    const users = await userModel
      .find({ "personal_info.username": new RegExp(query, "i") })
      .limit(50)
      .select(
        "personal_info.fullname personal_info.username personal_info.profile_img -_id",
      );

    return res.status(200).json({
      users,
    });
  } catch (error) {
    return res.status(400).json(error);
  }
};
