import toast from "react-hot-toast"
import { getFullDay } from "../common/date"
import { useUserContext } from "../context/UserContext"
import { useState } from "react"
import CommentField from "./CommentField"
import { useContext } from "react"
import axios from "axios"
import { BlogContext } from "../pages/BlogPage"
import { useConfirm } from "../context/ConfirmContext"

const CommentCard = ({index,leftVal,commentData}) => {
    const {commented_by,commentedAt,comment,_id}= commentData
    const {profile_img,fullname,username} = commented_by?.personal_info || {}

    const {userAuth:{access_token,username:authUsername}} = useUserContext()
    const {setBlog,setTotalParentCommentsLoaded} = useContext(BlogContext)
    const confirm = useConfirm()

    const [isReplying,setIsReplying] = useState(false)
    const [showReplies, setShowReplies] = useState(true)

    const removeComment = (comments, commentId) => comments
        .filter((currentComment) => currentComment._id !== commentId)
        .map((currentComment) => ({
            ...currentComment,
            children: currentComment.children
                ? removeComment(currentComment.children, commentId)
                : currentComment.children,
        }))

    const handleDelete = async () => {
        if (!access_token) return
        const confirmed = await confirm({
            title: "Delete comment",
            message: "This comment and its replies will be permanently deleted.",
            confirmLabel: "Delete",
            danger: true,
        })
        if (!confirmed) return

        try {
            const { data } = await axios.delete(
                import.meta.env.VITE_SERVER_DOMAIN + "/blog/delete-comment",
                {
                    data: { _id },
                    headers: { Authorization: `Bearer ${access_token}` },
                },
            )

            setBlog((currentBlog) => ({
                ...currentBlog,
                comments: removeComment(currentBlog.comments, _id),
                activity: {
                    ...currentBlog.activity,
                    total_comments: currentBlog.activity.total_comments - data.deleted_count,
                    total_parent_comments: currentBlog.activity.total_parent_comments - data.deleted_parent_count,
                },
            }))
            setTotalParentCommentsLoaded((count) => Math.max(0, count - data.deleted_parent_count))
        } catch (error) {
            toast.error(axios.isAxiosError(error) ? error.response?.data?.error || "Failed to delete comment." : "Failed to delete comment.")
        }
    }

    const handleReplyClick = ()=>{
        try{
            if(!access_token){
                toast.error("Login to reply to this comment.")
                return
            }

            setIsReplying(prev=>!prev)

        }catch(error){
            console.log(error)

        }

    }
  return (
    <div className="w-full  " style={{paddingLeft: `${leftVal*10}px`}}>
        <div className="my-5 p-6 rounded-md border border-grey ">
            <div className="flex gap-3 items-center mb-8">
                <img className="w-6 h-6 rounded-full" src={profile_img} alt="profile" />
                <p className="line-clamp-1">{fullname} @ {username}</p>
                <p className="min-w-fit">{getFullDay(commentedAt)}</p>
                {authUsername && username && authUsername === username ? (
                    <button
                        onClick={handleDelete}
                        title="Delete comment"
                        aria-label="Delete comment"
                        className="ml-auto text-dark-grey hover:text-red-500 cursor-pointer"
                    >
                        <i className="fi fi-rr-trash" />
                    </button>
                ) : null}
            </div>

            <p className="font-gelasio text-xl ml-5">{comment}</p>

            <div className="flex gap-5 items-center mt-5">
                <button onClick={handleReplyClick} className="underline cursor-pointer">Reply</button>
            </div>
            {
                isReplying ? 
                <div className="mt-8">
                    <CommentField action="reply" index={index} replyingTo={_id} setReplying={setIsReplying} />
                </div>
                :""
            }
            {commentData.children?.length ? (
                <button
                    onClick={() => setShowReplies(prev => !prev)}
                    className="mt-4 text-sm underline cursor-pointer"
                >
                    {showReplies ? "Hide replies" : `Show replies (${commentData.children.length})`}
                </button>
            ) : null}
        </div>
        {showReplies && commentData.children?.length ? (
            <div className="ml-5 border-l-2 border-grey pl-4">
                {commentData.children.map((childComment, childIndex) => {
                    if (!childComment || typeof childComment !== "object") return null

                    return (
                        <CommentCard
                            key={childComment._id || `${_id}-child-${childIndex}`}
                            index={childIndex}
                            leftVal={0}
                            commentData={childComment}
                        />
                    )
                })}
            </div>
        ) : null}
    </div>
  )
}

export default CommentCard