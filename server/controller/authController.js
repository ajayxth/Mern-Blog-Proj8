import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import { getAuth } from "firebase-admin/auth";

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // email for password

const formatDataToSend = (user) => {
  const access_token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return {
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
    access_token,
  };
};

const generateUsername = async (email) => {
  let username = email.split("@")[0];

  const isUsernameNotUnique = await userModel.exists({
    "personal_info.username": username,
  });

  if (isUsernameNotUnique) {
    username += nanoid().substring(0, 5);
  }

  return username;
};

const signup = async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    //validating data from frontend
    if (!fullname || !email || !password) {
      return res.status(403).json({
        error: "Fields must not be empty.",
      });
    }
    if (fullname.length < 3) {
      return res.status(403).json({
        error: "FullName must be more than 3 letters.",
      });
    }
    if (!emailRegex.test(email)) {
      return res.status(403).json({
        error: "Invalid Email.",
      });
    }
    if (!passwordRegex.test(password)) {
      return res.status(403).json({
        error:
          "Password must be 6-20 characters long with at least 1 uppercase letter.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create username
    const username = await generateUsername(email);

    // Create user
    const user = await userModel.create({
      personal_info: {
        fullname,
        email,
        password: hashedPassword,
        username,
      },
    });

    return res.status(200).json({
      status: "Successful",
      //   access_token,
      user: formatDataToSend(user),
    });
  } catch (error) {
    console.log(error);
    console.log(error);

    if (error.code === 11000) {
      return res.status(409).json({
        error: "Email already exists.",
      });
    }

    return res.status(500).json({
      error: "Something went wrong.",
    });
  }
};

const signin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(403).json({
      error: "Fields must not be empty.",
    });
  }
  try {
    const user = await userModel.findOne({ "personal_info.email": email });
    if (!user) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    // Google account cannot login with password
    if (user.google_auth) {
      return res.status(403).json({
        error: "Account was created with Google. Try logging in with Google.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.personal_info.password,
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        error: "Incorrect password.",
      });
    }

    return res.status(200).json({
      status: "Successful Login",
      user: formatDataToSend(user),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Something went wrong.",
    });
  }
};

const googleAuth = async (req, res) => {
  const { access_token } = req.body;
  try {
    const decodedUser = await getAuth().verifyIdToken(access_token);

    let { email, name, picture } = decodedUser;
    // console.log(picture)

    picture = picture.replace("s96-c", "s384-c");

    let user = await userModel
      .findOne({
        "personal_info.email": email,
      })
      .select(
        "personal_info.fullname personal_info.username personal_info.profile_img google_auth",
      );

    // User already exists
    if (user) {
      if (!user.google_auth) {
        return res.status(403).json({
          error:
            "This email was signed up without Google. Please log in with password to access the account",
        });
      }
    }

    // User does not exist
    else {
      const username = await generateUsername(email);

      user = new userModel({
        personal_info: {
          fullname: name,
          email,
          profile_img: picture,
          username,
        },
        google_auth: true,
      });

      user = await user.save();
    }

    return res.status(200).json({
      success: true,
      user: formatDataToSend(user),
    });
  } catch (error) {
    console.log(error);

    return res.status(401).json({
      error: "Invalid Firebase token.",
    });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (
    !passwordRegex.test(currentPassword) ||
    !passwordRegex.test(newPassword)
  ) {
    return res.status(400).json({
      error:"Password needs to be  6-20 character long. Atleast one uppercase,one numerical."
    })
  }

  try{
    const user=await userModel.findOne({_id:req.user})

    if(!user){
      return res.status(400).json({
      error:"User not found.."
    })
    }

    if(user.google_auth){
      return res.status(400).json({
      error:"User logged in through google."
    })
    }

    const checkCorrectPassword =await bcrypt.compare(currentPassword,user.personal_info.password)

    if (!checkCorrectPassword) {
    return res.status(401).json({
      error: "Current password is incorrect",
    });
    }

    const hashedPassword = await bcrypt.hash(newPassword,10)

    const u=await userModel.findOneAndUpdate({_id:req.user},{"personal_info.password":hashedPassword})

    return res.status(200).json({status:'Password Changed'})


  }catch(error){
    console.log(error);
  return res.status(500).json({
    error: "Something went wrong.",
  });
  }
};

export { signup, signin, googleAuth,changePassword };
