import toast from "react-hot-toast";
import AnimationWrapper from "../common/animation";
import { useEditorContext } from "../context/EditorContext";
import Tags from "./Tags";
import axios from "axios";
import { useUserContext } from "../context/UserContext";
import { useNavigate, useParams } from "react-router-dom";
import { useConfirm } from "../context/ConfirmContext";

const PublishForm = () => {

  const { blog_id } = useParams();

  const characterLimit = 200;
  const tagLimit = 10;

  const {
    userAuth: { access_token },
  } = useUserContext();

  const {
    blog: { title, des, banner, tags,content },
    setEditorState,

    setBlog,
  } = useEditorContext();

  const navigate = useNavigate();
  const confirm = useConfirm();

  // console.log(blog.title);
  // console.log(blog.banner);
  // console.log(blog.content.blocks);

  const handleCloseEvent = () => {
    setEditorState("editor");
  };

  const handleBlogTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;

    setBlog((prev) => ({
      ...prev,
      title,
    }));
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.keyCode == 13) {
      e.preventDefault();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();

      const tag = e.currentTarget.value.trim();

      if (tags.length >= tagLimit) {
        return toast.error(`You can add a maximum of ${tagLimit} tags.`);
      }

      if (!tag) return;

      if (tags.includes(tag)) {
        toast.error("This tag already exists.");
        return;
      }

      setBlog((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));

      e.currentTarget.value = "";
    }
  };

  const handleBlogDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const des = e.target.value;

    setBlog((prev) => ({
      ...prev,
      des,
    }));
  };

  const publishForm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;

    if (button.classList.contains("disabled")) {
      return;
    }
    if (!title) {
      return toast.error("Write title before publishing.");
    }

    if (!des) {
      return toast.error("Write some description about your blog..");
    }

    if (!tags.length) {
      return toast.error("Enter at least 1 tag to help us rank your blog.");
    }

    const confirmed = await confirm({
      title: blog_id ? "Update blog" : "Publish blog",
      message: blog_id ? "Save these changes to your blog?" : "Publish this blog now?",
      confirmLabel: blog_id ? "Update" : "Publish",
    });
    if (!confirmed) return;

    const loadingToast = toast.loading("Publishing your blog...");

    button.classList.add("disabled");

    try {
      const blogObj = {
        id:blog_id,
        title,
        banner,
        content,
        des,
        tags,
        draft: false,
      };
      await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/blog/create-blog",
        blogObj,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      );
      button.classList.remove("disabled");

      toast.dismiss(loadingToast);
      toast.success("Blog published Successfully.");

      setTimeout(() => {
        navigate("/");
      }, 500);
    } catch (err) {
      button.classList.remove("disabled");
      toast.dismiss(loadingToast);

      if (axios.isAxiosError(err)) {
        return toast.error(
          err.response?.data?.error || "Failed to publish blog.",
        );
      }

      return toast.error("Something went wrong.");
    }
  };
  return (
    <AnimationWrapper>
      <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4  ">
        <button
          className="w-12 cursor-pointer h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]"
          onClick={handleCloseEvent}
        >
          <i className="fi fi-br-cross"></i>
        </button>

        <div className="max-w-[550px] center">
          <p className="text-dark-grey mb-1">Preview</p>

          <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
            <img src={banner} />
          </div>

          <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2">
            {title}
          </h1>

          <p className="font-gelasio line-clamp-2 text-xl leading-7 mt-4">
            {des}
          </p>
        </div>

        <div className="border-grey lg:border-l lg:pl-8">
          <p className="text-dark-grey mb-2 mt-9">Blog Title</p>
          <input
            type="text"
            placeholder="Blog Title"
            value={title}
            className="input-box pl-4"
            onChange={handleBlogTitleChange}
          />

          <p className="text-dark-grey mb-2 mt-9">
            Short description about your blog
          </p>
          <textarea
            maxLength={characterLimit}
            value={des}
            className="h-40 resize-none leading-7 input-box pl-4"
            onChange={handleBlogDescriptionChange}
            onKeyDown={handleTitleKeyDown}
          ></textarea>
          <p className="mt-1 text-dark-grey text-sm text-right">
            {characterLimit - des.length} characters left.
          </p>
          <p className="text-dark-grey mb-2 mt-9">
            Topics - ( Helps is searching and ranking your blog post )
          </p>

          <div className="relative input-box pl-2 py-2 pb-4">
            <input
              onKeyDown={handleKeyDown}
              type="text"
              placeholder="Topic"
              className="sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white "
            />
            {tags.map((tag, i) => (
              <Tags tag={tag} tagIndex={i} key={i} />
            ))}
          </div>
          <p className="mt-1 mb-4 text-dark-grey text-sm text-right">
            {tagLimit - tags.length} Tags left
          </p>

          <button
            onClick={publishForm}
            className="btn-dark px-8 cursor-pointer"
          >
            Publish
          </button>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default PublishForm;
