import { useEffect, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import {
  AlignCenter,
  AlignLeft,
  Bold,
  Code2,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Underline as UnderlineIcon,
  Unlink2,
  type LucideIcon,
} from "lucide-react";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onImageUpload: (file: File) => Promise<string>;
  promptForUrl?: (message: string, defaultValue?: string) => string | null;
};

type ToolbarAction = {
  label: string;
  title: string;
  icon: LucideIcon;
  isActive?: () => boolean;
  onClick: () => void;
};

export default function RichTextEditor({
  value,
  onChange,
  onImageUpload,
  promptForUrl,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: "editor-inline-link",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "editor-inline-image",
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center"],
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "editor-content editor-prosemirror content-surface min-h-[280px] bg-black px-5 py-4 text-[17px] leading-8 text-[#e8e8e8] outline-none",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || "<p></p>", false);
    }
  }, [editor, value]);

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !editor) {
      return;
    }

    const imageUrl = await onImageUpload(file);
    editor.chain().focus().setImage({ src: imageUrl }).run();
    event.target.value = "";
  }

  function handleLink() {
    if (!editor) {
      return;
    }

    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = (promptForUrl ?? window.prompt)("Enter link URL", previousUrl ?? "https://");

    if (!url) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  function handleRemoveLink() {
    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
  }

  function getButtonClass(active = false) {
    return `editor-toolbar-button ${
      active
        ? "editor-toolbar-button--active"
        : ""
    }`;
  }

  const toolbarGroups: ToolbarAction[][] = [
    [
      {
        label: "Paragraph",
        title: "Paragraph",
        icon: Pilcrow,
        isActive: () => Boolean(editor?.isActive("paragraph")),
        onClick: () => editor?.chain().focus().setParagraph().run(),
      },
      {
        label: "Heading 2",
        title: "Heading 2",
        icon: Heading2,
        isActive: () => Boolean(editor?.isActive("heading", { level: 2 })),
        onClick: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
      },
      {
        label: "Heading 3",
        title: "Heading 3",
        icon: Heading3,
        isActive: () => Boolean(editor?.isActive("heading", { level: 3 })),
        onClick: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
      },
    ],
    [
      {
        label: "Bold",
        title: "Bold",
        icon: Bold,
        isActive: () => Boolean(editor?.isActive("bold")),
        onClick: () => editor?.chain().focus().toggleBold().run(),
      },
      {
        label: "Italic",
        title: "Italic",
        icon: Italic,
        isActive: () => Boolean(editor?.isActive("italic")),
        onClick: () => editor?.chain().focus().toggleItalic().run(),
      },
      {
        label: "Underline",
        title: "Underline",
        icon: UnderlineIcon,
        isActive: () => Boolean(editor?.isActive("underline")),
        onClick: () => editor?.chain().focus().toggleUnderline().run(),
      },
    ],
    [
      {
        label: "Quote",
        title: "Quote",
        icon: Quote,
        isActive: () => Boolean(editor?.isActive("blockquote")),
        onClick: () => editor?.chain().focus().toggleBlockquote().run(),
      },
      {
        label: "Code Block",
        title: "Code Block",
        icon: Code2,
        isActive: () => Boolean(editor?.isActive("codeBlock")),
        onClick: () => editor?.chain().focus().toggleCodeBlock().run(),
      },
      {
        label: "Bullet List",
        title: "Bullet List",
        icon: List,
        isActive: () => Boolean(editor?.isActive("bulletList")),
        onClick: () => editor?.chain().focus().toggleBulletList().run(),
      },
      {
        label: "Ordered List",
        title: "Ordered List",
        icon: ListOrdered,
        isActive: () => Boolean(editor?.isActive("orderedList")),
        onClick: () => editor?.chain().focus().toggleOrderedList().run(),
      },
    ],
    [
      {
        label: "Align Left",
        title: "Align Left",
        icon: AlignLeft,
        isActive: () => Boolean(editor?.isActive({ textAlign: "left" }) || (!editor?.isActive({ textAlign: "center" }) && editor?.isActive("paragraph"))),
        onClick: () => editor?.chain().focus().setTextAlign("left").run(),
      },
      {
        label: "Align Center",
        title: "Align Center",
        icon: AlignCenter,
        isActive: () => Boolean(editor?.isActive({ textAlign: "center" })),
        onClick: () => editor?.chain().focus().setTextAlign("center").run(),
      },
    ],
    [
      {
        label: "Edit Link",
        title: "Edit Link",
        icon: Link2,
        isActive: () => Boolean(editor?.isActive("link")),
        onClick: handleLink,
      },
      {
        label: "Remove Link",
        title: "Remove Link",
        icon: Unlink2,
        isActive: () => false,
        onClick: handleRemoveLink,
      },
      {
        label: "Insert Image",
        title: "Insert Image",
        icon: ImagePlus,
        isActive: () => false,
        onClick: () => fileInputRef.current?.click(),
      },
    ],
  ];

  return (
    <div className="editor-frame">
      <div className="editor-toolbar-shell">
        <div className="editor-toolbar" role="toolbar" aria-label="Rich text formatting toolbar">
          {toolbarGroups.map((group, groupIndex) => (
            <div className="editor-toolbar-group" key={`toolbar-group-${groupIndex}`}>
              {group.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    type="button"
                    aria-label={action.label}
                    title={action.title}
                    className={getButtonClass(action.isActive?.())}
                    onClick={action.onClick}
                  >
                    <Icon size={16} strokeWidth={2} />
                  </button>
                );
              })}
              {groupIndex < toolbarGroups.length - 1 ? <div className="editor-toolbar-divider" aria-hidden="true" /> : null}
            </div>
          ))}
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
      <div className="editor-scroll-region">
        <div className="editor-content-shell">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
