import { Link, useNavigate, useParams } from "react-router-dom";
import logo from "../assets/logo-horizontal.svg";
import AnimationWrapper from "../common/animation";
import defaultBanner from "../assets/blog banner.png";
import { useEffect, useRef } from "react";
import { useEditorContext } from "../context/EditorContext";
import toast from "react-hot-toast";
import EditorJS from "@editorjs/editorjs";
import { tools } from "./ToolsComponent";
import { uploadImage } from "../common/aws";
import axios from "axios";
import { useUserContext } from "../context/UserContext";
import { useConfirm } from "../context/ConfirmContext";

const BlogEditor = () => {
  const blogBannerRef = useRef<HTMLImageElement>(null);
  const navigate = useNavigate();

  const {blog_id}
 = useParams()
  const {
    blog,
    blog: { title, banner, content, tags, des },
    setBlog,
    textEditor,
    setTextEditor,
    setEditorState,
  } = useEditorContext();

  const {
      userAuth: { access_token },
    } = useUserContext();
  const confirm = useConfirm();
  

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.keyCode == 13) {
      e.preventDefault();
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // console.log(e);
    const input = e.target;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
    setBlog({ ...blog, title: input.value });
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const img = e.target.files?.[0];

    if (img) {
      const loadingToast = toast.loading("Uploading...");
      const url = await uploadImage(img);

      if (url && blogBannerRef.current) {
        blogBannerRef.current.src = url;
        setBlog((prev) => ({ ...prev, banner: url }));
        toast.dismiss(loadingToast);
        toast.success("Uploaded Successfully");
      }
    }
  };

  const handlePublishEvent = async () => {
    if (!banner.length) {
      return toast.error("Please upload your banner.");
    }
    if (title.length == 0) {
      return toast.error("Please enter your blog title.");
    }
    if (textEditor?.isReady) {
    const data = await textEditor.save();
      if (data.blocks.length) {
    setBlog((prev) => ({
      ...prev,
      content: data,
    }));
    setEditorState("publish");
        console.log(data);
      } else {
        return toast.error("Please write something to publish it.");
      }
    }
  };

  const handleSaveDraft = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;

    if (button.classList.contains("disabled")) {
      return;
    }
    if (!title.trim()) {
      return toast.error("Write title before saving as draft.");
    }

    const confirmed = await confirm({
      title: "Save draft",
      message: "Save the current blog as a draft?",
      confirmLabel: "Save draft",
    });
    if (!confirmed) return;

    const loadingToast = toast.loading("Saving draft...");
    button.classList.add("disabled");

    try {
      let blogContent = content;

      if (textEditor?.isReady) {
        const savedData = await textEditor.save();
        blogContent = savedData;
        setBlog((prev) => ({ ...prev, content: savedData }));
      }

      const blogObj = {
        title,
        banner,
        content: blogContent,
        des,
        tags,
        draft: true,
      };

      await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/blog/create-blog",
        {...blogObj,id:blog_id},
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      );

      toast.dismiss(loadingToast);
      toast.success("Blog drafted Successfully.");

      setTimeout(() => {
        navigate("/");
      }, 500);
    } catch (err) {
      toast.dismiss(loadingToast);

      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.error || "Failed to save draft.");
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      button.classList.remove("disabled");
    }
  };

  useEffect(() => {
    const editor = new EditorJS({
      holder: "textEditor",
      data: Array.isArray(content) ? content[0] : content,
      tools,
      //   placeholder: "Lets write an awesome story",
    });

    editor.isReady.then(() => {
      setTextEditor(editor);
    });

    return () => {
      editor.destroy();
    };
  }, []);

  return (
    <>
      <nav className="navbar">
        <Link to={"/"} className="flex-none w-10">
          <img src={logo} className="w-full" />
        </Link>

        <p className="max-md:hidden text-black line-clamp-1 w-full">
          {title.length ? title : "New Blog"}
        </p>

        <div className="flex gap-4 ml-auto">
          <button
            className="btn-dark py-2 cursor-pointer"
            onClick={handlePublishEvent}
          >
            Publish
          </button>
          <button
            onClick={handleSaveDraft}
            className="btn-light py-2 cursor-pointer"
          >
            Save Draft
          </button>
        </div>
      </nav>

      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
              <label htmlFor="uploadBanner">
                <img
                  ref={blogBannerRef}
                  src={banner || defaultBanner}
                  className="z-20"
                />
                <input
                  id="uploadBanner"
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  hidden
                  // onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                  onChange={handleBannerUpload}
                />
              </label>
            </div>

            <textarea
              value={title}
              placeholder="Blog Title"
              className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40"
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>

            <hr className="w-full opacity-10 my-5" />

            <div id="textEditor" className="font-gelasio"></div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;
