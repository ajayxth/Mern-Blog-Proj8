import EditorJS from "@editorjs/editorjs";
import { createContext, useContext, useState } from "react";
import type { OutputData } from "@editorjs/editorjs";

export interface PersonalInfo {
  fullname: string;
  email: string;
  username: string;
  bio: string;
  profile_img: string;
}

export interface Author {
  _id: string;
  personal_info: PersonalInfo;
}

export interface Activity {
  total_likes: number;
  total_comments: number;
  total_reads: number;
  total_parent_comments: number;
}

export interface Blog {
  blog_id: string;
  title: string;
  banner: string;
  des: string;
  content: string[];
  tags: string[];
  author: Author;
  activity: Activity;
  comments: string[];
  draft: boolean;
  publishedAt?: string;
  updatedAt?: string;
}

interface EditorBlog {
  title: string;
  banner: string;
  content: OutputData;
  tags: string[];
  des: string;
  author: {
    personal_info: {
      fullname?: string;
      username?: string;
      profile_img?: string;
    };
  };
}

interface EditorContextType {
  blog: EditorBlog;
  setBlog: React.Dispatch<React.SetStateAction<EditorBlog>>;
  textEditor: EditorJS | null;
  setTextEditor: React.Dispatch<React.SetStateAction<EditorJS | null>>;
  editorState: string;
  setEditorState: React.Dispatch<React.SetStateAction<string>>;
  // image: File | null;
  // setImage: React.Dispatch<React.SetStateAction<File | null>>;
}

const blogStructure: EditorBlog = {
  title: "",
  banner: "",
  content: {
    blocks: [],
  },
  tags: [],
  des: "",
  author: { personal_info: {} },
};

export const EditorContext = createContext<EditorContextType | null>(null);

export const EditorContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [blog, setBlog] = useState<EditorBlog>(blogStructure);
  const [textEditor, setTextEditor] = useState<EditorJS | null>(null);
  const [editorState, setEditorState] = useState("editor");
  // const [image, setImage] = useState<File | null>(null);

  const value = {
    blog,
    setBlog,
    textEditor,
    setTextEditor,
    editorState,
    setEditorState,

  };

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
};

export const useEditorContext = () => {
  const context = useContext(EditorContext);

  if (!context) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }

  return context;
};
