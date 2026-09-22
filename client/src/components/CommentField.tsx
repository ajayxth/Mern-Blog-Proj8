import { useContext, useState } from "react";
import { useUserContext } from "../context/UserContext";
import toast from "react-hot-toast";
import axios from "axios";
import { BlogContext } from "../pages/BlogPage";

const CommentField = ({ action,index=undefined,replyingTo=undefined,setReplying }) => {
  const {blog,
    blog: {
      _id,
      author: { _id: blog_author },comments:commentsArr,activity,activity:{total_comments,total_parent_comments}
    },setBlog,setTotalParentCommentsLoaded
  } = useContext(BlogContext);

  const [comment, setComment] = useState("");
  const {
    userAuth: { access_token,username,fullname,profile_img },
  } = useUserContext();

  const handleComment = async () => {
    if (!access_token) {
      toast.error("Please login to comment to this post.");
      return;
    }
    if (!comment.length) {
      toast.error("Write something to leave a comment.");
      return;
    }
    try {
      const {data} =await axios.post(
      import.meta.env.VITE_SERVER_DOMAIN + "/blog/add-comment",
      {
        _id,
        blog_author,
        comment,replying_to:replyingTo
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    // console.log(data)

    setComment("");
    data.commented_by={personal_info:{username,profile_img,fullname}}
    let newCommentsArr

    if(replyingTo && typeof index === "number"){
      const parentComment = commentsArr[index]
      const updatedParentComment = {
        ...parentComment,
        children: [...(parentComment.children || []), data],
        isReplyLoaded: true,
      }

      data.childrenLevel = (parentComment.childrenLevel || 0) + 1
      data.parentIndex = index
      newCommentsArr = [...commentsArr]
      newCommentsArr[index] = updatedParentComment

    }else{
      data.childrenLevel = 0
      newCommentsArr = [data, ...commentsArr]

    }
    
    const parentCommentIncrementVal = replyingTo ? 0 : 1
    setBlog({
      ...blog,
      comments: newCommentsArr,
      activity: {
        ...activity,
        total_comments: total_comments + 1,
        total_parent_comments: total_parent_comments + parentCommentIncrementVal,
      },
    })

    setTotalParentCommentsLoaded(prev=>prev+parentCommentIncrementVal)

    if (replyingTo && setReplying) {
      setReplying(false)
    }


    

    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <textarea
        onChange={(e) => setComment(e.target.value)}
        className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
        value={comment}
        placeholder="leave a comment"
      ></textarea>
      <button
        onClick={handleComment}
        className="btn-dark cursor-pointer active:scale-90 duration-200 mt-5 px-10 "
      >
        {action}
      </button>
    </>
  );
};

export default CommentField;
