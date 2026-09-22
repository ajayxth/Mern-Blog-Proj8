import axios from "axios";
import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import AnimationWrapper from "../common/animation";
import Loader from "../components/Loader";
import { getFullDay } from "../common/date";
import BlogInteraction from "../components/BlogInteraction";
import { BlogPostCard } from "../components/BlogPostCard";
import BlogContent from "../components/BlogContent";
import CommentsContainer, { fetchComments } from "../components/CommentsContainer";

const blogStructure = {
  title: "",
  des: "",
  content: [],
  author: { personal_info: [] },
  banner: "",
  publishedAt: "",
};

export const BlogContext = createContext({})

const BlogPage = () => {
  const { blog_id } = useParams();

  const [blog, setBlog] = useState(blogStructure);
  const [similarBlog,setSimilarBlog] = useState(null)
  const [isLikedByUser,setIsLikedByUser] = useState(false)
  const [loading, setLoading] = useState(true);
  const [commentsWrapper,setCommentsWrapper] = useState(false)
  const [totalParentCommentsLoaded,setTotalParentCommentsLoaded] = useState(0)
  const [hasMoreComments,setHasMoreComments] = useState(false)


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

      
      blog.comments = await fetchComments({
        blog_id: blog._id,
        setParentCommentCountFun: setTotalParentCommentsLoaded,
        setHasMoreComments,
      })

      // console.log("after->",blog)

      setBlog(blog);
      
      // console.log(blog.content)

      const {data} = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/blog/search-blogs",{
        tag:blog.tags[0],limit:6,eliminate_blog: blog_id
      })
      setSimilarBlog(data.blogs)
      // console.log(data.blogs)

      
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetStates = ()=>{
    setBlog(blogStructure)
    setSimilarBlog(null)
    setLoading(true)
    setIsLikedByUser(false)
    // setCommentsWrapper(false)
    setTotalParentCommentsLoaded(0)
    setHasMoreComments(false)
  }

  useEffect(() => {
    resetStates()
    fetchBlog();
  }, [blog_id]);
  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <BlogContext.Provider value={{blog,setBlog,isLikedByUser,setIsLikedByUser,commentsWrapper,setCommentsWrapper,totalParentCommentsLoaded,setTotalParentCommentsLoaded,hasMoreComments,setHasMoreComments}}>


        <CommentsContainer />

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

            <div className="my-12 font-gelasio blog-page-content">
              {
                content[0].blocks.map((block,i)=>{
                  return (
                    <div key={i} className="my-4 md:my-8">
                      <BlogContent block={block} />

                    </div>
                  )
                })
              }
            </div>


            <BlogInteraction />

            {
              similarBlog != null && similarBlog.length ? 
                <>
                    <h1 className="text-2xl mt-14 mb-10 font-medium">Similar Blogs</h1>

                    {
                      similarBlog.map((blog,i)=>{


                        return (
                          <AnimationWrapper key={i} keyValue={blog.blog_id} transition={{duration:1,delay:i*0.08}}>
                            <BlogPostCard content={blog} author={blog.author.personal_info} />

                          </AnimationWrapper>
                        )
                      })
                    }
                </>
              :
              ""
            }



          </div>
        </BlogContext.Provider>
      )}
    </AnimationWrapper>
  );
};

export default BlogPage;
