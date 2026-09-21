import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import AnimationWrapper from "../common/animation";
import Loader from "./Loader";
import { useUserContext } from "../context/UserContext";
import AboutUserComponent from "./AboutUserComponent";
import { filterPaginationData } from "../common/filterPaginationData";
import InPageNavigation from "./InPageNavigation";
import { BlogPostCard } from "./BlogPostCard";
import NoData from "./NoData";
import LoadMoreDataBtn from "./LoadMoreDataBtn";
import PageNotFound from "../pages/PageNotFound";

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

const ProfilePage = () => {
  const { id: profileId } = useParams();

  const [profile, setProfile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(false);
  const [blogs, setBlogs] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState("");

  const {
    personal_info: { fullname, username: profile_username, profile_img, bio },
    account_info: { total_posts, total_reads },
    social_links,
    joinedAt,
  } = profile;

  const {
    userAuth: { username },
  } = useUserContext();

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const { data: user } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/user/get-profile",
        {
          username: profileId,
        },
      );
      if (!user) {
        toast.error("User not found");
        return;
      }

      setProfile(user);
      setProfileLoaded(profileId);
      getBlogs({ page: 1 }, user._id);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.error || "Failed to fetch user profile",
        );
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setProfile(profileDataStructure);
    setProfileLoaded("");
    setLoading(true);
  };

  const getBlogs = async ({ page = 1 }, user_id) => {
    try {
      user_id = user_id == undefined ? blogs.user_id : user_id;

      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/blog/search-blogs",
        {
          author: user_id,
          page,
        },
      );

      const formattedData = await filterPaginationData({
        state: blogs,
        data: data.blogs,
        page,
        countRoute: "/blog/search-blogs-count",
        data_to_send: { author: user_id },
      });

      //   console.log(formattedData);

      formattedData.user_id = user_id;
      setBlogs(formattedData);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.error || "Failed to fetch user profile",
        );
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  useEffect(() => {
    if (profileId != profileLoaded) {
      setBlogs(null);
    }
    if (blogs == null) {
      resetState();
      fetchUserProfile();
    }
  }, [profileId,blogs]);
  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        profile_username.length ?
        <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12 ">
          <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-[50%] md:pl-8 md:border-1 border-grey md:sticky md:top-[100px] md:py-10">
            <img
              src={profile_img}
              className="w-48 h-48 bg-grey rounded-full md:w-32 md:h-32"
              alt="profile_pic"
            />

            <h1 className="text-2xl font-medium">@{profile_username}</h1>
            <p className="text-xl capitalize h-6">{fullname}</p>

            <p>
              {total_posts.toLocaleString()} blogs -{" "}
              {total_reads.toLocaleString()} reads
            </p>

            <div className="flex gap-4 mt-2">
              {profileId == username ? (
                <Link
                  to={"/setting/edit-profile"}
                  className="btn-light rounded-md"
                >
                  Edit Profile
                </Link>
              ) : (
                " "
              )}
            </div>

            <AboutUserComponent
              className="max-md:hidden"
              bio={bio}
              social_links={social_links}
              joinedAt={joinedAt}
            />
          </div>

          <div className="max-md:mt-12 w-full">
            <InPageNavigation
              routes={["Blogs Published", "About"]}
              defaultHidden={["About"]}
            >
              <>
                {blogs == null ? (
                  <Loader />
                ) : blogs.results.length ? (
                  blogs.results.map((blog, i) => {
                    return (
                      <AnimationWrapper
                        transition={{ duration: 1, delay: i * 0.1 }}
                        key={i}
                      >
                        <BlogPostCard
                          content={blog}
                          author={blog.author.personal_info}
                        />
                      </AnimationWrapper>
                    );
                  })
                ) : (
                  <NoData message="No blogs Published" />
                )}
                <LoadMoreDataBtn state={blogs} fetchDataFun={getBlogs} />
              </>

              <AboutUserComponent
                bio={bio}
                social_links={social_links}
                joinedAt={joinedAt}
              />
            </InPageNavigation>
          </div>
        </section>
        : <PageNotFound />
      )}
    </AnimationWrapper>
  );
};

export default ProfilePage;
