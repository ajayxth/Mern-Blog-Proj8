import { Navigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import BlogEditor from "../components/BlogEditor";
import PublishForm from "../components/PublishForm";
import {
  EditorContextProvider,
  useEditorContext,
} from "../context/EditorContext";

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

const Editor = () => {
  return (
    <EditorContextProvider>
      <EditorContent />
    </EditorContextProvider>
  );
};

export default Editor;