import { useEffect } from "react";
import { useEditorContext } from "../context/EditorContext";

const Tags = ({ tag, tagIndex }: { tag: string; tagIndex: number }) => {
  const {
    blog: { tags },
    setBlog,
    blog,
  } = useEditorContext();

  const handleTagDelete = () => {
    setBlog((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleTagEdit = (e: React.KeyboardEvent<HTMLParagraphElement>) => {
    if (e.key !== "Enter" && e.key !== ",") return;

    e.preventDefault();

    const currentTag = e.currentTarget.textContent?.trim() ?? "";

    if (!currentTag) return;

    setBlog((prev) => ({
      ...prev,
      tags: prev.tags.map((item, index) =>
        index === tagIndex ? currentTag : item,
      ),
    }));

    e.currentTarget.contentEditable = "false";

  };

  const addEditable = (e: React.MouseEvent<HTMLParagraphElement>) => {
  e.currentTarget.contentEditable = "true";
  e.currentTarget.focus();
};

  return (
    <div className="relative p-2 mt-2 mr-2 px-5 bg-white rounded-full inline-block hover:bg-opacity-50 pr-10">
      <p
        className="outline-none"
        onKeyDown={handleTagEdit}
        onClick={addEditable}
      >
        {tag}
      </p>
      <button
        onClick={handleTagDelete}
        className="mt-[2px] cursor-pointer active:scale-90 hover:opacity-50 rounded-full absolute right-3 top-1/2 -translate-y-1/2"
      >
        <i className="fi fi-br-cross text-sm pointer-events-none"></i>
      </button>
    </div>
  );
};

export default Tags;
