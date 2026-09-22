import { Navigate, useParams } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import BlogEditor from "../components/BlogEditor";
import PublishForm from "../components/PublishForm";
import {
  EditorContextProvider,
  useEditorContext,
} from "../context/EditorContext";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import axios from "axios";
import toast from "react-hot-toast";

const EditorContent = () => {

  
  const { editorState } = useEditorContext();
  const {
    userAuth: { access_token },
  } = useUserContext();

  

  if (access_token === null) {
    return <Navigate to="/signin" />;
  }

  return editorState === "editor" ? <BlogEditor /> : <PublishForm />;
};

const EditorLoader = () => {
  const { blog_id } = useParams();
  const [loading,setLoading] = useState(true)
  const { setBlog } = useEditorContext();

  useEffect(() => {
    const loadBlog = async () => {
      if (!blog_id) {
        setLoading(false);
        return;
      }

      try {
        const { data:{blog} } = await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + "/blog/get-blog",
          { blog_id,draft:true,mode:'edit' },
        );

        setBlog(blog);
      } catch (error) {
        toast.error(axios.isAxiosError(error) ? error.message : "Failed to load blog.");
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
  }, [blog_id, setBlog]);
  return (
    loading ? <Loader /> : <EditorContent />
  );
};

const Editor = () => (
  <EditorContextProvider>
    <EditorLoader />
  </EditorContextProvider>
);

export default Editor;