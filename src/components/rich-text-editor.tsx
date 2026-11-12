"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

type RichTextEditorProps = {
  content: string;
  onChange: (content: string) => void;
};

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
    editorProps: { attributes: { class: "admin-rich-content", "aria-label": "Rich-text content" } },
  });

  if (!editor) return <div className="admin-rich-editor admin-rich-content">Loading editor…</div>;

  const buttons = [
    { label: "B", title: "Bold", active: editor.isActive("bold"), action: () => editor.chain().focus().toggleBold().run() },
    { label: "I", title: "Italic", active: editor.isActive("italic"), action: () => editor.chain().focus().toggleItalic().run() },
    { label: "H2", title: "Heading 2", active: editor.isActive("heading", { level: 2 }), action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "H3", title: "Heading 3", active: editor.isActive("heading", { level: 3 }), action: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: "• List", title: "Bullet list", active: editor.isActive("bulletList"), action: () => editor.chain().focus().toggleBulletList().run() },
    { label: "1. List", title: "Numbered list", active: editor.isActive("orderedList"), action: () => editor.chain().focus().toggleOrderedList().run() },
    { label: "Quote", title: "Block quote", active: editor.isActive("blockquote"), action: () => editor.chain().focus().toggleBlockquote().run() },
    { label: "Undo", title: "Undo", active: false, action: () => editor.chain().focus().undo().run() },
    { label: "Redo", title: "Redo", active: false, action: () => editor.chain().focus().redo().run() },
  ];

  return (
    <div className="admin-rich-editor">
      <div aria-label="Text formatting" className="admin-rich-toolbar" role="toolbar">
        {buttons.map((button) => (
          <button
            aria-label={button.title}
            aria-pressed={button.active}
            key={button.title}
            onClick={() => button.action()}
            title={button.title}
            type="button"
          >
            {button.label}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
