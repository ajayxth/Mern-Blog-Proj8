import axios from "axios";
import AnimationWrapper from "../common/animation";
import InPageNavigation from "../components/InPageNavigation";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import { BlogPostCard } from "../components/BlogPostCard";
import MinimalBlogCard from "../components/MinimalBlogCard";
import { tabButtonsRef } from "../components/InPageNavigation";
import NoData from "../components/NoData";
import { filterPaginationData } from "../common/filterPaginationData";
import LoadMoreDataBtn from "../components/LoadMoreDataBtn";

const HomePage = () => {
  const [blogs, setBlogs] = useState(null);
  const [trendingBlogs, setTrendingBlogs] = useState(null);
  const [pageState, setPageState] = useState("home");

  const categories = [
    "programming",
    "sports",
    "finance",
    "socials",
    "agriculture",
    "films",
    "from",
    "football",
  ];

  const fetchLatestBlogs = async ({ page = 1 }) => {
    try {
      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/blog/latest-blogs",
        {
          page,
        },
      );
      //   console.log(data.blogs)

      const formattedData = await filterPaginationData({
        state: blogs,
        data: data.blogs,
        page,
        countRoute: "/blog/all-latest-blogs-count",
      });
      // console.log(formattedData);
      setBlogs(formattedData);
      //   setBlogs(data.blogs);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const fetchTrendingBlogs = async () => {
    try {
      const { data } = await axios.get(
        import.meta.env.VITE_SERVER_DOMAIN + "/blog/trending-blogs",
      );
      setTrendingBlogs(data.blogs);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const fetchBlogsByCategory = async ({ page = 1 }) => {
    try {
      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/blog/search-blogs",
        {
          tag: pageState,
          page,
        },
      );
      const formattedData = await filterPaginationData({
        state: blogs,
        data: data.blogs,
        page,
        countRoute: "/blog/search-blogs-count",
        data_to_send: { tag: pageState },
      });
      console.log(formattedData);
      setBlogs(formattedData);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const loadByCategory = (e) => {
    const category = e.currentTarget.innerText.toLowerCase();

    setBlogs(null);
    if (pageState == category) {
      setPageState("home");
      return;
    }
    setPageState(category);
  };

  useEffect(() => {
    tabButtonsRef.current[0]?.click();
    if (pageState == "home") {
      fetchLatestBlogs({ page: 1 });
    } else {
      fetchBlogsByCategory({ page: 1 });
    }

    if (!trendingBlogs) {
      fetchTrendingBlogs();
    }
  }, [pageState]);

  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        {/* latest blogs */}
        <div className="w-full">
          <InPageNavigation
            routes={[pageState, "trending posts"]}
            defaultHidden={["trending posts"]}
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
                fetchDataFun={
                  pageState === "home" ? fetchLatestBlogs : fetchBlogsByCategory
                }
              />
            </>

            {trendingBlogs == null ? (
              <Loader />
            ) : trendingBlogs.length ? (
              trendingBlogs.map((blog, i) => {
                return (
                  <AnimationWrapper
                    transition={{ duration: 1, delay: i * 0.1 }}
                    key={i}
                  >
                    <MinimalBlogCard blog={blog} index={i} />
                  </AnimationWrapper>
                );
              })
            ) : (
              <NoData message="No blogs Published" />
            )}
          </InPageNavigation>
        </div>

        {/* filters and trending blogs */}
        <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
          <div className="flex flex-col gap-10">
            <div className="">
              <h1 className="font-medium text-xl mb-8">
                Stories from all interests
              </h1>

              <div className="flex gap-3 flex-wrap">
                {categories.map((category, i) => {
                  return (
                    <button
                      onClick={loadByCategory}
                      className={
                        "tag cursor-pointer transition-all duration-300" +
                        (pageState == category ? " bg-black text-white" : " ")
                      }
                      key={i}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h1 className="font-medium text-xl mb-8">
                Trending<i className="fi fi-rr-arrow-trend-up"></i>
              </h1>

              {trendingBlogs == null ? (
                <Loader />
              ) : trendingBlogs.length ? (
                trendingBlogs.map((blog, i) => {
                  return (
                    <AnimationWrapper
                      transition={{ duration: 1, delay: i * 0.1 }}
                      key={i}
                    >
                      <MinimalBlogCard blog={blog} index={i} />
                    </AnimationWrapper>
                  );
                })
              ) : (
                <NoData message="No blogs Published" />
              )}
            </div>
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;
