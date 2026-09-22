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
    return res.status(500).json(error);
  }
};


export const getProfile =async (req,res)=>{
  try{
    let {username} = req.body

  const user = await userModel.findOne({"personal_info.username": username})
  .select("-personal_info.password -google_auth -updatedAt -blogs")

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.status(200).json(user)
  }catch(error){
    return res.status(500).json(error);
  }
  



}



