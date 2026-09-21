import { useParams } from "react-router-dom";
import InPageNavigation from "../components/InPageNavigation";
import Loader from "../components/Loader";
import { useEffect, useState } from "react";
import AnimationWrapper from "../common/animation";
import { BlogPostCard } from "../components/BlogPostCard";
import NoData from "../components/NoData";
import LoadMoreDataBtn from "../components/LoadMoreDataBtn";
import axios from "axios";
import { filterPaginationData } from "../common/filterPaginationData";
import toast from "react-hot-toast";

const SearchPage = () => {
  const { query } = useParams();

  const [blogs, setBlogs] = useState(null);

  const searchBlogs = async ({ page = 1, create_new_arr = false }) => {
    try {
      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/blog/search-blogs",
        {
          query,page,
        },
      );

      const formattedData = await filterPaginationData({
        state: blogs,
        data: data.blogs,
        page,
        data_to_send:{query},
        countRoute: "/blog/search-blogs-count",
        create_new_arr
      });

      setBlogs(formattedData);
      //   setBlogs(data.blogs);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  useEffect(()=>{
    searchBlogs({page :1,create_new_arr:true})

  },[query])

  
  return (
    <section className="h-cover flex justify-center gap-10 ">
      <div className="w-full ">
        <InPageNavigation
          routes={[`Search results from ${query}`, "Accounts Matched"]}
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
            <LoadMoreDataBtn
                state={blogs}
                fetchDataFun={searchBlogs}
              />
          </>
        </InPageNavigation>
      </div>
    </section>
  );
};

export default SearchPage;
