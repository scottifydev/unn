"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write here...",
  minHeight = "240px",
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        style: `min-height: ${minHeight}`,
      },
    },
  });

  if (!mounted) {
    return (
      <div
        className="rounded border border-seam bg-graphite"
        style={{ minHeight }}
      />
    );
  }

  function setLink() {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", prev ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  }

  const tools: { label: string; active: boolean; action: () => void }[] = [
    { label: "B", active: editor?.isActive("bold") ?? false, action: () => editor?.chain().focus().toggleBold().run() },
    { label: "I", active: editor?.isActive("italic") ?? false, action: () => editor?.chain().focus().toggleItalic().run() },
    { label: "H2", active: editor?.isActive("heading", { level: 2 }) ?? false, action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "H3", active: editor?.isActive("heading", { level: 3 }) ?? false, action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: "UL", active: editor?.isActive("bulletList") ?? false, action: () => editor?.chain().focus().toggleBulletList().run() },
    { label: "OL", active: editor?.isActive("orderedList") ?? false, action: () => editor?.chain().focus().toggleOrderedList().run() },
    { label: "\"", active: editor?.isActive("blockquote") ?? false, action: () => editor?.chain().focus().toggleBlockquote().run() },
    { label: "Link", active: editor?.isActive("link") ?? false, action: setLink },
    { label: "—", active: false, action: () => editor?.chain().focus().setHorizontalRule().run() },
  ];

  return (
    <div className="tiptap-editor rounded border border-seam">
      <div className="tiptap-toolbar">
        {tools.map((t, i) => (
          <button
            key={i}
            type="button"
            onClick={t.action}
            className={t.active ? "is-active" : ""}
          >
            {t.label}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
