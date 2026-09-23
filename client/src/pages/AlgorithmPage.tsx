import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import AnimationWrapper from "../common/animation";
import Loader from "../components/Loader";

interface AlgorithmBlog {
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
      profile_img?: string;
    };
  };
}

interface ScoredBlog extends AlgorithmBlog {
  score: number;
  ageDays: number;
}

interface TopicCluster {
  label: string;
  posts: AlgorithmBlog[];
}

const DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;
const DECAY_HALF_LIFE_DAYS = 14;

const getAgeInDays = (publishedAt: string) =>
  Math.max(0, (Date.now() - new Date(publishedAt).getTime()) / DAY_IN_MILLISECONDS);

const getPopularityScore = (blog: AlgorithmBlog) => {
  const engagement =
    blog.activity.total_likes * 4 +
    blog.activity.total_comments * 3 +
    blog.activity.total_reads;
  const recencyWeight = Math.pow(0.5, getAgeInDays(blog.publishedAt) / DECAY_HALF_LIFE_DAYS);

  return engagement * recencyWeight;
};

const getJaccardSimilarity = (firstTags: string[], secondTags: string[]) => {
  const first = new Set(firstTags.map((tag) => tag.toLowerCase()));
  const second = new Set(secondTags.map((tag) => tag.toLowerCase()));
  const union = new Set([...first, ...second]);

  if (!union.size) return 0;
  return [...first].filter((tag) => second.has(tag)).length / union.size;
};

const getTopicClusters = (blogs: AlgorithmBlog[]): TopicCluster[] => {
  const remaining = new Set(blogs.map((_, index) => index));
  const clusters: TopicCluster[] = [];

  while (remaining.size) {
    const firstIndex = remaining.values().next().value as number;
    const queue = [firstIndex];
    const clusterIndexes = new Set<number>();
    remaining.delete(firstIndex);

    while (queue.length) {
      const currentIndex = queue.shift() as number;
      clusterIndexes.add(currentIndex);

      for (const candidateIndex of remaining) {
        if (getJaccardSimilarity(blogs[currentIndex].tags, blogs[candidateIndex].tags) > 0) {
          queue.push(candidateIndex);
          remaining.delete(candidateIndex);
        }
      }
    }

    const posts = [...clusterIndexes].map((index) => blogs[index]);
    const tagCounts = new Map<string, number>();
    posts.forEach((post) => {
      post.tags.forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1));
    });
    const label = [...tagCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "Mixed topics";
    clusters.push({ label, posts });
  }

  return clusters.sort((first, second) => second.posts.length - first.posts.length);
};

const formatScore = (score: number) => (score >= 100 ? score.toFixed(0) : score.toFixed(1));

const AlgorithmCard = ({ blog, score, note }: { blog: AlgorithmBlog; score?: number; note?: string }) => (
  <Link to={`/blog/${blog.blog_id}`} className="group flex gap-4 border-b border-grey py-5 first:pt-0 last:border-0">
    <div className="h-24 w-24 flex-none overflow-hidden rounded-md bg-grey sm:h-28 sm:w-32">
      <img src={blog.banner} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
    </div>
    <div className="min-w-0 flex-1">
      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-dark-grey">
        <span>{blog.author?.personal_info?.fullname || "Blogo writer"}</span>
        <span>{blog.activity.total_reads} reads</span>
        <span>{blog.activity.total_likes} likes</span>
      </div>
      <h3 className="line-clamp-2 text-xl font-medium leading-tight">{blog.title}</h3>
      <p className="mt-2 line-clamp-2 font-gelasio text-base text-dark-grey">{blog.des}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {blog.tags.slice(0, 3).map((tag) => <span className="tag px-3 py-1 text-xs" key={tag}>{tag}</span>)}
        {score !== undefined && <span className="text-sm text-dark-grey">Score {formatScore(score)}</span>}
        {note && <span className="text-sm text-dark-grey">{note}</span>}
      </div>
    </div>
  </Link>
);

const AlgorithmPage = () => {
  const [blogs, setBlogs] = useState<AlgorithmBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlogId, setSelectedBlogId] = useState("");

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/blog/algorithm-blogs`);
        setBlogs(data.blogs || []);
        setSelectedBlogId(data.blogs?.[0]?.blog_id || "");
      } catch (error) {
        toast.error(axios.isAxiosError(error) ? error.response?.data?.error || "Could not load algorithm data." : "Could not load algorithm data.");
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, []);

  const popularityRanking = useMemo<ScoredBlog[]>(
    () => blogs
      .map((blog) => ({ ...blog, score: getPopularityScore(blog), ageDays: getAgeInDays(blog.publishedAt) }))
      .sort((first, second) => second.score - first.score),
    [blogs],
  );

  const selectedBlog = blogs.find((blog) => blog.blog_id === selectedBlogId) || blogs[0];
  const relatedPosts = useMemo(
    () => selectedBlog
      ? blogs
        .filter((blog) => blog.blog_id !== selectedBlog.blog_id)
        .map((blog) => ({ blog, similarity: getJaccardSimilarity(selectedBlog.tags, blog.tags) }))
        .filter(({ similarity }) => similarity > 0)
        .sort((first, second) => second.similarity - first.similarity)
        .slice(0, 5)
      : [],
    [blogs, selectedBlog],
  );
  const topicClusters = useMemo(() => getTopicClusters(blogs), [blogs]);

  return (
    <AnimationWrapper keyValue="algorithm-page">
      <main className="min-h-screen bg-grey/30">
        <section className="border-b border-grey bg-white pb-12 pt-14">
          <div className="mx-auto max-w-6xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-purple">Blogo intelligence</p>
            <div className="max-w-3xl">
              <h1 className="text-5xl font-medium leading-tight max-md:text-4xl">A sharper way to find what matters.</h1>
              <p className="mt-5 max-w-2xl font-gelasio text-xl leading-8 text-dark-grey">Explore published stories through three transparent ranking methods: freshness-aware popularity, shared-topic similarity, and tag-based topic clusters.</p>
            </div>
            <div className="mt-8 grid max-w-3xl grid-cols-3 gap-3 text-sm max-sm:grid-cols-1">
              <div className="border-l-2 border-purple px-4"><strong className="block text-2xl">{blogs.length}</strong><span className="text-dark-grey">stories analyzed</span></div>
              <div className="border-l-2 border-purple px-4"><strong className="block text-2xl">14 days</strong><span className="text-dark-grey">popularity half-life</span></div>
              <div className="border-l-2 border-purple px-4"><strong className="block text-2xl">3 views</strong><span className="text-dark-grey">of the same library</span></div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl space-y-8 py-10">
          {loading ? <Loader /> : !blogs.length ? <p className="py-16 text-center text-dark-grey">Publish a few stories to activate these views.</p> : (
            <>
              <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                <article className="bg-white p-6 shadow-sm sm:p-8">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div><p className="text-sm font-medium uppercase tracking-wider text-purple">01 / Freshness weighted</p><h2 className="mt-2 text-3xl font-medium">Popular this week</h2></div>
                    <i className="fi fi-rr-arrow-trend-up text-2xl text-purple" aria-hidden="true" />
                  </div>
                  <p className="mb-6 max-w-xl font-gelasio text-lg leading-7 text-dark-grey">Engagement counts more when a story is recent. Every 14 days, the time component halves so the list can keep changing.</p>
                  <div>{popularityRanking.slice(0, 5).map((item) => <AlgorithmCard key={item.blog_id} blog={item} score={item.score} note={`${item.ageDays.toFixed(0)}d old`} />)}</div>
                </article>

                <article className="bg-black p-6 text-white shadow-sm sm:p-8">
                  <p className="text-sm font-medium uppercase tracking-wider text-purple">How it works</p>
                  <h2 className="mt-2 text-3xl font-medium">Popularity score</h2>
                  <p className="mt-5 font-gelasio text-lg leading-7 text-white/70">The ranking combines meaningful actions and applies exponential recency decay.</p>
                  <div className="mt-8 border-t border-white/20 pt-6 font-mono text-sm leading-7 text-white/80">(likes x 4 + comments x 3 + reads)<br />x 0.5 ^ (age in days / 14)</div>
                  <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/20 pt-6 text-sm"><div><strong className="block text-2xl">4x</strong>likes</div><div><strong className="block text-2xl">3x</strong>comments</div><div><strong className="block text-2xl">1x</strong>reads</div></div>
                </article>
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                <article className="bg-white p-6 shadow-sm sm:p-8">
                  <p className="text-sm font-medium uppercase tracking-wider text-purple">02 / Tag overlap</p>
                  <h2 className="mt-2 text-3xl font-medium">Posts related to</h2>
                  <select value={selectedBlog?.blog_id || ""} onChange={(event) => setSelectedBlogId(event.target.value)} className="mt-5 w-full rounded-md border border-grey bg-grey p-3 text-base">
                    {blogs.map((blog) => <option key={blog.blog_id} value={blog.blog_id}>{blog.title}</option>)}
                  </select>
                  <p className="mt-4 font-gelasio text-lg leading-7 text-dark-grey">Jaccard similarity compares shared tags with the total unique tags between two stories.</p>
                  <div className="mt-5">{relatedPosts.length ? relatedPosts.map(({ blog, similarity }) => <AlgorithmCard key={blog.blog_id} blog={blog} note={`${Math.round(similarity * 100)}% tag match`} />) : <p className="py-6 text-dark-grey">No shared-tag neighbors for this story yet.</p>}</div>
                </article>

                <article className="bg-white p-6 shadow-sm sm:p-8">
                  <p className="text-sm font-medium uppercase tracking-wider text-purple">03 / Topic map</p>
                  <h2 className="mt-2 text-3xl font-medium">Clusters by conversation</h2>
                  <p className="mt-4 font-gelasio text-lg leading-7 text-dark-grey">Stories join a cluster when they share at least one tag. The most frequent tag names each group.</p>
                  <div className="mt-6 space-y-6">{topicClusters.slice(0, 5).map((cluster) => <div key={cluster.label}><div className="mb-3 flex items-center justify-between"><h3 className="text-xl font-medium capitalize">{cluster.label}</h3><span className="text-sm text-dark-grey">{cluster.posts.length} {cluster.posts.length === 1 ? "story" : "stories"}</span></div><div className="space-y-3">{cluster.posts.slice(0, 2).map((blog) => <Link className="block border-l-2 border-grey pl-4 text-dark-grey hover:border-purple hover:text-black" to={`/blog/${blog.blog_id}`} key={blog.blog_id}>{blog.title}</Link>)}</div></div>)}</div>
                </article>
              </div>
            </>
          )}
        </section>
      </main>
    </AnimationWrapper>
  );
};

export default AlgorithmPage;
