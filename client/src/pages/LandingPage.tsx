import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import AnimationWrapper from "../common/animation";
import Loader from "../components/Loader";
import defaultBanner from "../assets/blog banner.png";

interface LandingBlog {
  blog_id: string;
  title: string;
  des: string;
  banner: string;
  tags: string[];
  publishedAt: string;
  activity: {
    total_likes: number;
    total_comments: number;
    total_reads: number;
  };
  author?: {
    personal_info?: {
      fullname?: string;
      username?: string;
    };
  };
}

const getPopularityScore = (blog: LandingBlog) => {
  const ageInDays = Math.max(0, (Date.now() - new Date(blog.publishedAt).getTime()) / 86400000);
  const engagement = blog.activity.total_likes * 4 + blog.activity.total_comments * 3 + blog.activity.total_reads;
  return engagement * Math.pow(0.5, ageInDays / 14);
};

const getSetCoverSelection = (blogs: LandingBlog[], limit = 4) => {
  const uncoveredTags = new Set(blogs.flatMap((blog) => blog.tags.map((tag) => tag.toLowerCase())));
  const remainingBlogs = new Set(blogs);
  const selection: LandingBlog[] = [];

  while (remainingBlogs.size && selection.length < limit && uncoveredTags.size) {
    let bestBlog: LandingBlog | undefined;
    let bestGain = 0;
    let bestPopularity = -1;

    remainingBlogs.forEach((blog) => {
      const gain = blog.tags.filter((tag) => uncoveredTags.has(tag.toLowerCase())).length;
      const popularity = getPopularityScore(blog);

      if (gain > bestGain || (gain === bestGain && popularity > bestPopularity)) {
        bestBlog = blog;
        bestGain = gain;
        bestPopularity = popularity;
      }
    });

    if (!bestBlog || bestGain === 0) break;

    selection.push(bestBlog);
    remainingBlogs.delete(bestBlog);
    bestBlog.tags.forEach((tag) => uncoveredTags.delete(tag.toLowerCase()));
  }

  return selection;
};

const LandingPage = () => {
  const [blogs, setBlogs] = useState<LandingBlog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStories = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/blog/algorithm-blogs`);
        setBlogs(data.blogs || []);
      } catch (error) {
        toast.error(axios.isAxiosError(error) ? error.response?.data?.error || "Unable to load stories." : "Unable to load stories.");
      } finally {
        setLoading(false);
      }
    };

    loadStories();
  }, []);

  const rankedBlogs = useMemo(
    () => blogs.map((blog) => ({ blog, score: getPopularityScore(blog) })).sort((a, b) => b.score - a.score),
    [blogs],
  );
  const featuredBlog = rankedBlogs[0]?.blog || blogs[0];
  const perspectiveBlogs = blogs.slice(1, 4);
  const coverageBlogs = useMemo(() => getSetCoverSelection(blogs), [blogs]);
  const coveredTagCount = new Set(coverageBlogs.flatMap((blog) => blog.tags.map((tag) => tag.toLowerCase()))).size;

  return (
    <AnimationWrapper keyValue="landing-page">
      <main className="landing-page bg-white font-inter text-black">
        <section className="border-b border-grey bg-grey/30 py-12 md:py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="max-w-xl">
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-purple">A quieter place to publish</p>
              <h1 className="max-w-lg text-4xl font-medium leading-tight md:text-6xl">Good writing deserves more than a fast scroll.</h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-dark-grey">Blogo gives thoughtful writers a simple place to publish and gives readers better ways to find stories worth their time.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/editor" className="btn-dark bg-purple">Start writing <span aria-hidden="true">-&gt;</span></Link>
                <Link to="/blogs" className="btn-light">Read the latest <span className="ml-2 text-xs text-dark-grey">{blogs.length || "new"} stories</span></Link>
              </div>
              <p className="mt-7 text-sm text-dark-grey">Fresh ideas, clear discovery, no performance required.</p>
            </div>

            <div className="border border-grey bg-white p-3 shadow-[0_16px_45px_rgba(32,42,53,0.1)] md:p-5">
              {loading ? <div className="flex h-64 items-center justify-center"><Loader /></div> : featuredBlog ? (
                <Link to={`/blog/${featuredBlog.blog_id}`} className="group block">
                  <div className="relative h-56 overflow-hidden bg-grey md:h-72"><img src={featuredBlog.banner || defaultBanner} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /><span className="absolute left-4 top-4 bg-white px-3 py-1 text-xs text-purple">Featured from the community</span></div>
                  <div className="px-1 pb-1 pt-5">
                    <p className="text-sm text-dark-grey">{featuredBlog.author?.personal_info?.fullname || "Blogo writer"} <span className="text-purple">@{featuredBlog.author?.personal_info?.username || "writer"}</span></p>
                    <h2 className="mt-3 text-2xl font-medium leading-tight md:text-3xl">{featuredBlog.title}</h2>
                    <p className="mt-3 line-clamp-2 text-dark-grey">{featuredBlog.des}</p>
                    <div className="mt-5 flex flex-wrap items-center gap-2">{featuredBlog.tags.slice(0, 3).map((tag) => <span className="tag px-3 py-1 text-xs" key={tag}>{tag}</span>)}<span className="ml-auto text-sm text-dark-grey">{featuredBlog.activity.total_reads} reads</span></div>
                  </div>
                </Link>
              ) : <p className="p-10 text-center text-dark-grey">Your first story will appear here.</p>}
            </div>
          </div>
        </section>

        <section className="border-b border-grey py-16 md:py-24">
          <div className="mx-auto max-w-6xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-purple">The Blogo difference</p>
            <h2 className="mx-auto mt-3 max-w-xl font-gelasio text-3xl leading-tight md:text-4xl">A publishing ecosystem engineered for substance over noise.</h2>
            <p className="mx-auto mt-4 max-w-xl font-gelasio text-dark-grey">Traditional platforms sort by noise. Blogo helps readers discover writing with mathematical clarity.</p>
            <div className="mt-12 grid gap-4 text-left md:grid-cols-3">
              {["Freshness-aware ranking", "Topic clustering via tags", "Distraction-free publishing"].map((title, index) => <article className="border border-grey bg-white p-6 shadow-sm" key={title}><span className="text-sm text-purple">0{index + 1} / {index === 0 ? "Discovery engine" : index === 1 ? "Signal model" : "Author experience"}</span><h3 className="mt-5 font-gelasio text-2xl">{title}</h3><p className="mt-3 leading-6 text-dark-grey">{["Stories remain discoverable without letting yesterday's popularity define today's best work.", "Connect with readers through the exact topics you care about and the conversations around them.", "A calm canvas for ideas, with tools that keep the focus on making something worth reading."][index]}</p><p className="mt-8 border-t border-grey pt-4 text-xs text-dark-grey">✓ Transparent and explainable</p></article>)}
            </div>
          </div>
        </section>

        <section className="border-b border-grey bg-grey/30 py-16 md:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div><p className="text-xs font-medium uppercase tracking-[0.2em] text-purple">Transparent algorithm</p><h2 className="mt-3 max-w-md font-gelasio text-4xl leading-tight">How Blogo scores and ranks stories.</h2><p className="mt-5 max-w-md font-gelasio text-lg leading-7 text-dark-grey">Unlike other platforms hidden behind vanity loops, Blogo publishes its discovery formula directly.</p><div className="mt-8 border-t border-grey pt-5 font-mono text-xs leading-6 text-dark-grey">(likes x 4 + comments x 3 + reads)<br />x 0.5 ^ (age in days / 14)</div><div className="mt-8 grid grid-cols-3 gap-3 text-sm"><div><b className="block text-2xl">4x</b><span className="text-dark-grey">likes weight</span></div><div><b className="block text-2xl">3x</b><span className="text-dark-grey">comments weight</span></div><div><b className="block text-2xl">14d</b><span className="text-dark-grey">half-life decay</span></div></div></div>
            <div className="rounded-xl bg-[#111827] p-5 text-white shadow-xl md:p-7"><div className="flex items-center justify-between border-b border-white/10 pb-5"><div><p className="text-xs uppercase tracking-wider text-purple">01 / freshness ranking</p><h3 className="mt-1 font-gelasio text-2xl">Popular this week</h3></div><span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">Live</span></div><div className="divide-y divide-white/10">{rankedBlogs.slice(0, 3).map(({ blog, score }, index) => <Link to={`/blog/${blog.blog_id}`} className="grid grid-cols-[28px_1fr_auto] gap-3 py-5" key={blog.blog_id}><span className="font-gelasio text-2xl text-white/40">0{index + 1}</span><span><b className="block font-gelasio text-lg">{blog.title}</b><small className="text-white/50">{blog.tags.slice(0, 2).join(" / ")}</small></span><span className="text-right text-sm text-purple">Score {score.toFixed(1)}<small className="block text-white/40">fresh signal</small></span></Link>)}</div></div>
          </div>
        </section>

        <section className="border-b border-grey py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-purple">Greedy topic coverage</p>
                <h2 className="mt-3 max-w-xl font-gelasio text-3xl leading-tight md:text-4xl">A small reading list with a wide point of view.</h2>
                <p className="mt-4 max-w-2xl font-gelasio text-lg leading-7 text-dark-grey">Each selection covers the largest number of topics not represented yet, so a short list still gives readers range.</p>
              </div>
              <div className="border-l-2 border-purple px-4 text-sm text-dark-grey"><strong className="block text-2xl text-black">{coveredTagCount}</strong>topics covered</div>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {coverageBlogs.map((blog, index) => (
                <Link to={`/blog/${blog.blog_id}`} className="group border border-grey bg-white p-5 shadow-sm transition-shadow hover:shadow-md" key={blog.blog_id}>
                  <p className="text-xs uppercase tracking-wider text-purple">Pick 0{index + 1}</p>
                  <h3 className="mt-5 line-clamp-3 font-gelasio text-xl leading-7">{blog.title}</h3>
                  <div className="mt-6 flex flex-wrap gap-2">{blog.tags.slice(0, 4).map((tag) => <span className="tag px-3 py-1 text-xs" key={tag}>{tag}</span>)}</div>
                  <p className="mt-6 text-xs text-dark-grey">Covers {blog.tags.length} topic{blog.tags.length === 1 ? "" : "s"}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24"><div className="mx-auto max-w-6xl"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-medium uppercase tracking-[0.2em] text-purple">Fresh perspectives</p><h2 className="mt-3 font-gelasio text-3xl">What curious minds are exploring today</h2></div><Link to="/blogs" className="link">View all stories -&gt;</Link></div><div className="mt-10 grid gap-4 md:grid-cols-3">{perspectiveBlogs.map((blog) => <Link to={`/blog/${blog.blog_id}`} className="border border-grey bg-white p-5 shadow-sm transition-shadow hover:shadow-md" key={blog.blog_id}><p className="text-xs text-dark-grey">{blog.author?.personal_info?.fullname || "Blogo writer"}</p><h3 className="mt-5 line-clamp-3 font-gelasio text-xl leading-7">{blog.title}</h3><p className="mt-5 line-clamp-2 text-sm text-dark-grey">{blog.des}</p><span className="mt-8 inline-block text-xs text-purple">{blog.tags[0] || "Explore"}</span></Link>)}</div></div></section>

        <section className="border-t border-grey py-16 md:py-24"><div className="mx-auto max-w-5xl rounded-2xl bg-purple px-7 py-14 text-center text-white shadow-xl md:px-10"><p className="text-xs uppercase tracking-[0.2em] text-white/70">Start publishing under your own terms</p><h2 className="mx-auto mt-5 max-w-xl font-gelasio text-4xl leading-tight md:text-5xl">Claim your channel. Find your readers today.</h2><p className="mx-auto mt-5 max-w-lg font-gelasio text-lg text-white/80">No paywalls. No sponsored distractions. Just clear prose, transparent discovery, and a global community of thoughtful minds.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link to="/signup" className="rounded-full bg-white px-6 py-3 text-sm text-purple">Create your free account</Link><Link to="/blogs" className="rounded-full border border-white/40 px-6 py-3 text-sm text-white">Browse recent stories -&gt;</Link></div></div></section>
      </main>
    </AnimationWrapper>
  );
};

export default LandingPage;
