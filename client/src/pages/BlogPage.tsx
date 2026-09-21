import axios from "axios";
import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import AnimationWrapper from "../common/animation";
import Loader from "../components/Loader";
import { getFullDay } from "../common/date";
import BlogInteraction from "../components/BlogInteraction";

const blogStructure = {
  title: "",
  des: "",
  content: [],
  tags: [],
  author: { personal_info: [] },
  banner: "",
  publishedAt: "",
};

export const BlogContext = createContext({})

const BlogPage = () => {
  const { blog_id } = useParams();

  const [blog, setBlog] = useState(blogStructure);

  const [loading, setLoading] = useState(true);

  const {
    title,
    content,
    banner,
    author: {
      personal_info: { fullname, username: author_username, profile_img },
    },
    publishedAt,
  } = blog;

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const {
        data: { blog },
      } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/blog/get-blog",
        { blog_id },
      );

      setBlog(blog);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, []);
  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <BlogContext.Provider value={{blog,setBlog}}>
          <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">
            <img src={banner} className="aspect-video" alt="banner" />

            <div className="mt-12">
              <h2 className="">{title}</h2>

              <div className="flex max-sm:flex-col justify-between my-8">
                <div className="flex gap-5 items-start">
                  <img
                    src={profile_img}
                    alt="profile"
                    className="w-12 h-12 rounded-full"
                  />
                  <p className="capitalize">
                    {fullname}
                    <br />
                    <Link className="underline" to={`/user/${author_username}`}>
                      @{author_username}
                    </Link>
                  </p>
                </div>
                <p className="text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">
                  Published on {getFullDay(publishedAt)}
                </p>
              </div>
            </div>

            <BlogInteraction />
          </div>
        </BlogContext.Provider>
      )}
    </AnimationWrapper>
  );
};

export default BlogPage;
