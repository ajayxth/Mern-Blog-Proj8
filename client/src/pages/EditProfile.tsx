import { useEffect, useRef, useState } from "react";
import { useUserContext } from "../context/UserContext";
import axios from "axios";
import AnimationWrapper from "../common/animation";
import Loader from "../components/Loader";
import InputBox from "../components/InputComponent";
import { uploadImage } from "../common/aws";
import toast from "react-hot-toast";
import { storeInSession } from "../common/session";
import { useConfirm } from "../context/ConfirmContext";

const profileDataStructure = {
  personal_info: {
    fullname: "",
    email: "",
    username: "",
    bio: "",
    profile_img: "",
  },
  social_links: {},
  account_info: {
    total_posts: 0,
    total_reads: 0,
  },
  _id: "",
  joinedAt: "",
  __v: 0,
};

const EditProfile = () => {
  const {
    userAuth,
    userAuth: { access_token },
    setUserAuth,
  } = useUserContext();
  const bioLimit = 150;

  const [profile, setProfile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(false);
  const [charactersLeft, setCharactersLeft] = useState(bioLimit);
  const profileImgEle = useRef();
  const [updatedProfileImg, setUpdatedProfileImg] = useState(null);
  const [loadingImgUpload, setLoadingImgUpload] = useState(false);
  const [loadingProfileUpdate, setLoadingProfileUpdate] = useState(false);
  const confirm = useConfirm();



  const editProfileForm = useRef()

  const {
    personal_info: {
      fullname,
      username: profile_username,
      profile_img,
      email,
      bio,
    },
    social_links,
  } = profile;

  useEffect(() => {
    const getProfile = async () => {
      if (!access_token) return;

      try {
        setLoading(true);
        const { data } = await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + "/user/get-profile",
          {
            username: userAuth.username,
          },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          },
        );

        setProfile(data);
        // console.log(profile);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [access_token, userAuth.username]);

  const handleCharacterChange = (e) => {
    setCharactersLeft(bioLimit - e.currentTarget.value.length);
  };

  const handleImagePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const img = e.currentTarget.files?.[0];
    if (!img || !profileImgEle.current) return;

    profileImgEle.current.src = URL.createObjectURL(img);
    setUpdatedProfileImg(img);
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (updatedProfileImg) {
      const confirmed = await confirm({
        title: "Update profile image",
        message: "Replace your current profile image?",
        confirmLabel: "Update",
      });
      if (!confirmed) return;
      const loadingToast = toast.loading("Uploading img...");
      try {
        setLoadingImgUpload(true);

        const url = await uploadImage(updatedProfileImg);
        if (!url) {
          return toast.error("No img url");
        }

        const { data } = await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + "/api/auth/update-profile-img",
          { url },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          },
        );
        const newUserAuth = { ...userAuth, profile_img: data.profile_img };
        storeInSession("user", JSON.stringify(newUserAuth));
        setUserAuth(newUserAuth);
        setUpdatedProfileImg(null);
        toast.success("Uploaded Img");
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.error || "Failed to upload image.");
        } else {
          toast.error("Something went wrong.");
        }
      } finally {
        setLoadingImgUpload(false);
        toast.dismiss(loadingToast);
      }
    }
  };

  const handleSubmit =async (e: React.MouseEvent<HTMLButtonElement>)=>{
    e.preventDefault()

    if (!editProfileForm.current) return;

    const form = new FormData(editProfileForm.current)

    const formData: Record<string, string> = {};

    for(const[key,value] of form.entries()){
        formData[key] = value.toString()
    }
    const {username,bio,youtube,facebook,twitter,website,github,instagram} = formData

    if(username.length<3){
        return toast.error("Username must be atleast 3 characters long.")
    }
    if(bio.length>bioLimit){
        return toast.error("Bio must be atmost 150 characters.")
    }
    const confirmed = await confirm({
      title: "Update profile",
      message: "Save these profile changes?",
      confirmLabel: "Update",
    });
    if (!confirmed) return;
    const loadingToast = toast.loading("Updating Profile...")

    try{
        
        const {data}=await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/api/auth/update-profile",{
            username,bio,social_links:{youtube,facebook,twitter,website,github,instagram}
        },{
            headers:{
                "Authorization" : `Bearer ${access_token}`
            }
        })

        if(userAuth.username != data.username){
            const newUserAuth = {...userAuth,username:data.username}
            storeInSession("user",JSON.stringify(newUserAuth))
            setUserAuth(newUserAuth)
        }
        toast.success("Profile updated.")
    }catch(error){
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.error || "Failed to upload image.");
        } else {
          toast.error("Something went wrong.");
        }
    }finally{
        toast.dismiss(loadingToast);
    }


  }
  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <form ref={editProfileForm}>
          <h1 className="max-md:hidden">Edit Profile</h1>

          <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
            <div className="max-lg:mx-auto mb-5">
              <label
                className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden"
                htmlFor="uploadImg"
                id="profileImgLabel"
              >
                <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center text-white bg-black/30 opacity-0 hover:opacity-100 cursor-pointer">
                  Upload Image
                </div>
                <img
                  ref={profileImgEle}
                  src={profile_img || undefined}
                  alt="profileImg"
                />
              </label>
              <input
                onChange={handleImagePreview}
                type="file"
                id="uploadImg"
                accept=".jpeg, .png, .jpg"
                hidden
              />

              <button
                onClick={handleImageUpload}
                className="btn-light mt-5 max-lg:center lg:w-full cursor-pointer px-10"
              >
                {loadingImgUpload ? "Uploading..." : "Upload"}
              </button>
            </div>

            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
                <div>
                  <InputBox
                    name="fullname"
                    type="text"
                    value={fullname}
                    placeholder="Full Name"
                    icon="fi-rr-user"
                    disable={true}
                  />
                </div>
                <div>
                  <InputBox
                    name="email"
                    type="email"
                    value={email}
                    placeholder="Email"
                    icon="fi-rr-envelope"
                    disable={true}
                  />
                </div>
              </div>

              <InputBox
              name="username"
                type="text"
                value={profile_username}
                placeholder="Username"
                icon="fi-rr-at"
              />

              <p className="text-dark-grey -mt-3">
                Username will used to search user.
              </p>

              <textarea
                onChange={handleCharacterChange}
                name="bio"
                maxLength={bioLimit}
                defaultValue={bio}
                className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5"
                placeholder="Bio"
              ></textarea>
              <p className="mt-1 text-dark-grey">
                {charactersLeft} charactersLeft
              </p>

              <p className="my-6 text-dark-grey">
                Add your social handles below.
              </p>

              <div className="md:grid md:grid-cols-2 gap-x-6">
                {Object.keys(social_links).map((key, i) => {
                  const link = social_links[key];

                  return (
                    <InputBox
                      key={i}
                      name={key}
                      type="text"
                      value={link}
                      placeholder="https://"
                      icon={
                        "fi " +
                        (key != "website" ? "fi-brands-" + key : "fi-rr-globe")
                      }
                    />
                  );
                })}
              </div>

              <button onClick={handleSubmit} className="btn-dark w-auto px-10" type="submit">
                {
                    loadingProfileUpdate ? "Updating..." : "Update"
                }
              </button>
            </div>
          </div>
        </form>
      )}
    </AnimationWrapper>
  );
};

export default EditProfile;
