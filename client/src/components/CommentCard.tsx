import toast from "react-hot-toast"
import { getFullDay } from "../common/date"
import { useUserContext } from "../context/UserContext"
import { useState } from "react"
import CommentField from "./CommentField"

const CommentCard = ({index,leftVal,commentData}) => {
    const {commented_by,commentedAt,comment,_id}= commentData
    const {profile_img,fullname,username} = commented_by?.personal_info || {}

    const {userAuth:{access_token}} = useUserContext()

    const [isReplying,setIsReplying] = useState(false)
    const [showReplies, setShowReplies] = useState(true)

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