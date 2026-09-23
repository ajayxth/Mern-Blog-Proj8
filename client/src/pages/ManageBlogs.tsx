import axios from "axios"
import { useEffect, useState } from "react"
import { useUserContext } from "../context/UserContext"
import { filterPaginationData } from "../common/filterPaginationData"
import InPageNavigation from "../components/InPageNavigation"
import LoadMoreDataBtn from "../components/LoadMoreDataBtn"
import { Link } from "react-router-dom"
import { getDate } from "../common/date"
import toast from "react-hot-toast"
import { useConfirm } from "../context/ConfirmContext"

export const ManageBlogs = () => {

    const {userAuth:{access_token}} = useUserContext()
    const [blogs,setBlogs] = useState(null)
    const [drafts,setDrafts] = useState(null)
    const [query,setQuery] = useState("")
    const confirm = useConfirm()

    const getBlogs =async ({page,draft,deletedDocCount = 0})=>{
        try{
            const {data} = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/blog/user-written-blogs",{
                page,draft,query,deletedDocCount
            },{
                headers:{
                    "Authorization":`Bearer ${access_token}`
                }
            })

            const formattedData =await filterPaginationData({
                state:draft ? drafts : blogs,
                data:data.blogs,
                page,
                access_token,
                countRoute: "/blog/user-written-blogs-count",
                data_to_send: {draft,query}
            })

            if(draft){
                setDrafts(formattedData)
            }else{
                setBlogs(formattedData)
            }
        }catch(err){
            console.log(err)
        }

    }

    useEffect(()=>{
        if(access_token){
            if(blogs == null){
                getBlogs({page:1,draft:false})
            }
            if(drafts == null){
                getBlogs({page:1,draft:true})
            }
        }
    },[access_token,blogs,drafts,query])


    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>)=>{
        const searchQuery = e.currentTarget.value;
        setQuery(searchQuery)

        if(e.key === "Enter" && searchQuery.length){
            setBlogs(null)
            setDrafts(null)

        }
    }

    const handleChange = (e)=>{
        if(e.target.value.length){
            setQuery("")
            setBlogs(null)
            setDrafts(null)

        }

    }

    const handleDelete = async (blog_id:string, draft:boolean) => {
        const confirmed = await confirm({
            title: "Delete blog",
            message: "This blog will be permanently deleted.",
            confirmLabel: "Delete",
            danger: true,
        })
        if (!confirmed) return

        try {
            await axios.delete(import.meta.env.VITE_SERVER_DOMAIN + "/blog/delete-blog", {
                data: { blog_id },
                headers: { Authorization: `Bearer ${access_token}` },
            })

            const updateState = (state:any) => state ? {
                ...state,
                results: state.results.filter((blog:any) => blog.blog_id !== blog_id),
                totalDocs: Math.max(0, state.totalDocs - 1),
            } : state

            if (draft) setDrafts(updateState)
            else setBlogs(updateState)
            toast.success("Blog deleted")
        } catch (error) {
            toast.error(axios.isAxiosError(error) ? error.response?.data?.error || "Failed to delete blog" : "Failed to delete blog")
        }
    }

    const renderBlogs = (state:any, draft:boolean) => {
        if (!state) return <p className="text-dark-grey">Loading blogs...</p>
        if (!state.results.length) return <p className="text-dark-grey">No {draft ? "drafts" : "published blogs"} found.</p>

        return <>
            <div className="space-y-4">
                {state.results.map((blog:any) => (
                    <article key={blog.blog_id} className="flex gap-4 border-b border-grey pb-4">
                        <img src={blog.banner || undefined} alt="" className="w-28 h-20 object-cover rounded-md bg-grey" />
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-dark-grey mb-1">{draft ? "Draft" : getDate(blog.publishedAt)}</p>
                            <h2 className="font-gelasio text-xl line-clamp-1">{blog.title}</h2>
                            <p className="text-sm text-dark-grey line-clamp-1 mt-1">{blog.des || "No description"}</p>
                            <div className="flex gap-4 mt-3 text-sm">
                                <Link to={`/editor/${blog.blog_id}`} className="link">Edit</Link>
                                <button type="button" onClick={() => handleDelete(blog.blog_id, draft)} className="text-red-500 cursor-pointer">Delete</button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
            <div className="flex justify-center mt-8">
                <LoadMoreDataBtn state={state} fetchDataFun={(options:any) => getBlogs({ ...options, draft })} />
            </div>
        </>
    }


  return (
    <>
    
        <h1 className="max-md:hidden ">Manage Blogs</h1>
        <div className="relative max-md:mt-5 md:mt-8 mb-10">

            <input onKeyDown={handleSearch} onChange={handleChange} type="search" className="w-full bg-grey p-4 pl-12 pr-6 rounded-full placeholder:text-dark-grey" placeholder="Search Blogs" />

            <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>

            

        </div>

        <InPageNavigation routes={["Published Blogs","Drafts"]} >
            {renderBlogs(blogs, false)}
            {renderBlogs(drafts, true)}
            

            </InPageNavigation>
    </>
    
  )
}
