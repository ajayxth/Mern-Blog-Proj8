import  { useContext } from 'react'
import { BlogContext } from '../pages/BlogPage'
import CommentField from './CommentField'
import axios from 'axios'
import NoData from './NoData'
import AnimationWrapper from '../common/animation'
import CommentCard from './CommentCard'


export const fetchComments =async ({skip=0,blog_id,setParentCommentCountFun,setHasMoreComments,comment_array=null})=>{
  try{
    const {data} = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/blog/get-blog-comments",{
    blog_id,skip
  })

  data.map(comment=>{
    comment.childrenLevel = 0
  })
  setParentCommentCountFun(prev=>prev + data.length)
  setHasMoreComments(data.length === 5)

  return comment_array == null ? data : [...comment_array, ...data]
  }catch(error){
    console.log(error)
    return []
  }

}

const CommentsContainer = () => {
  const {blog,blog:{_id,title,comments:commentsArr},commentsWrapper,setCommentsWrapper,totalParentCommentsLoaded,setTotalParentCommentsLoaded,setBlog,hasMoreComments,setHasMoreComments} = useContext(BlogContext) 

    const loadMoreComments =async ()=>{
      try{
        const newCommentsArr = await fetchComments({skip:totalParentCommentsLoaded,blog_id:_id,setParentCommentCountFun:setTotalParentCommentsLoaded,setHasMoreComments,comment_array:commentsArr})

        setBlog({...blog,comments:newCommentsArr})
      }catch(error){
        console.log(error)
        return []
      }

    }
  return (
    <div className={"max-sm:w-full fixed "+ (commentsWrapper ? "top-0 sm:right-0" : "top-[100%] sm:right-[-100%]")+ " duration-700 max-sm:right-0 sm:top-0 w-[30%] min-w-[350px] h-full z-50 bg-white shadow-2xl p-8 px-16 overflow-y-auto overflow-x-hidden"}>


    <div className='relative'>
      <h1 className='text-xl font-medium'>Comments</h1>
        <p className='text-lg mt-2 w-[70%] text-dark-grey line-clamp-1'>{title}</p>

        <button onClick={()=>setCommentsWrapper(prev=>!prev)} className='absolute top-0 right-0 flex justify-center items-center active:scale-90 duration-200 cursor-pointer w-12 h-12 rounded-full bg-grey'>
          <i className='fi fi-br-cross text-2xl mt-1'></i>
        </button>
    </div>

    <hr className='border-grey my-8 w-[120%] -ml-10' />
    <CommentField action="comment" />
    {
      commentsArr && commentsArr.length ? 

      commentsArr.map((comment,i)=>{
        return (
          <AnimationWrapper key={i}>
          <CommentCard index={i} leftVal={0} commentData={comment}  />

          </AnimationWrapper>
        )

      })
      : <NoData message='No comments' />

    }

    {
      hasMoreComments ? 
      <button onClick={loadMoreComments} className='text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md cursor-pointer flex items-center gap-2'>
        Load More
      </button> : 
      ""
    }

    </div>
  )
}

export default CommentsContainer