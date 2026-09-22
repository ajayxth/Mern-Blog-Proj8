import { useContext, useEffect } from "react"
import { BlogContext } from "../pages/BlogPage"
import { Link } from "react-router-dom"
import { useUserContext } from "../context/UserContext"
import toast from "react-hot-toast"
import axios from "axios"

const BlogInteraction = () => {
    let {blog,activity,blog:{_id,title,blog_id,activity:{total_comments},activity:{total_likes},author:{personal_info:{username:author_username}}},setBlog,isLikedByUser,setIsLikedByUser,setCommentsWrapper} = useContext(BlogContext)

    const {userAuth:{username,access_token}} = useUserContext()

    const handleLike =async ()=>{
      if(access_token){
        setIsLikedByUser(preVal=>!preVal)
       !isLikedByUser ? total_likes++ : total_likes--;

        setBlog({ ...blog, activity: { ...activity, total_likes } })
        
        try{
          const {data} =await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/blog/like-blog",{
          _id,isLikedByUser
        },{
          headers:{
            'Authorization': `Bearer ${access_token}`
          }
        })
        console.log(data)
        }catch(error){
          console.log(error)
        }
        
      }else{
        toast.error("Please login to like the post.")
      }
    }

    useEffect(() => {
  const checkLike = async () => {
    if (access_token) {
      try {
        const { data:{result} } = await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + "/blog/isLiked-by-user",
          { _id },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );

        setIsLikedByUser(Boolean(result))
      } catch (error) {
        console.log(error);
      }
    }
  };

  checkLike();
}, []);
  return (
    <>
  <hr className="border-grey my-2" />

  <div className="flex gap-6 justify-between">
    <div className="flex gap-3 items-center">
      <button onClick={handleLike} className={" active:scale-90 duration-200 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer "+ (isLikedByUser ? "bg-red-500/20 text-red-500" : "bg-grey/80")}>
        <i className={"fi "+(isLikedByUser ? "fi-sr-heart" : "fi-rr-heart")}></i>
      </button>
      <p className="text-xl text-dark-grey">{total_likes}</p>

      <button onClick={()=>setCommentsWrapper(prev=>!prev)} className="w-10 cursor-pointer active:scale-90 duration-200 h-10 rounded-full flex items-center justify-center bg-grey/80">
        <i className="fi fi-rr-comment-dots"></i>
      </button>
      <p className="text-xl text-dark-grey">{total_comments}</p>
    </div>

    <div className="flex gap-6 items-center">
        {
            username == author_username ? 
            <Link to={`/editor/${blog_id}`} className="underline hover:text-purple">Edit</Link>
            :" "

        }

      <Link to={`https://twitter.com/intent/tweet?text=Read${title}&url=${location.href}`}>
        <i className="fi fi-brands-twitter text-xl hover:text-twitter"></i>
      </Link>
    </div>
  </div>

  {/* This is now outside the flex div */}
  <hr className="border-grey my-2" />
</>
  )
}

export default BlogInteraction