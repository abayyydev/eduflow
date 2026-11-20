"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  RotateCcw,
  RotateCw,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  Maximize2,
} from "lucide-react";

interface TipTapWysiwygEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function TipTapWysiwygEditor({
  content,
  onChange,
  placeholder,
}: TipTapWysiwygEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Highlight,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: content || "<p>Tuliskan materi pembelajaran Anda di sini...</p>",
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none focus:outline-none min-h-[360px] p-4 text-sm text-slate-800 leading-relaxed font-normal",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync content if external material changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="w-full min-h-[360px] p-4 rounded-xl border border-slate-200 bg-white/80 animate-pulse text-xs text-slate-400">
        Memuat editor WYSIWYG...
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-slate-200/90 bg-white/85 backdrop-blur-md overflow-hidden shadow-xs flex flex-col">
      {/* WYSIWYG Toolbar */}
      <div className="border-b border-slate-200/80 bg-white/95 px-3 py-2 flex items-center flex-wrap gap-1 text-slate-600 text-xs shadow-2xs">
        {/* History */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition"
          title="Undo (Ctrl+Z)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition"
          title="Redo (Ctrl+Y)"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1" />

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`px-2 py-1 rounded-md text-xs font-bold transition ${
            editor.isActive("paragraph")
              ? "bg-cyan-500 text-white"
              : "hover:bg-slate-100 text-slate-700"
          }`}
          title="Paragraph Normal"
        >
          P
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 rounded-md text-xs font-bold transition ${
            editor.isActive("heading", { level: 1 })
              ? "bg-cyan-500 text-white"
              : "hover:bg-slate-100 text-slate-700"
          }`}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded-md text-xs font-bold transition ${
            editor.isActive("heading", { level: 2 })
              ? "bg-cyan-500 text-white"
              : "hover:bg-slate-100 text-slate-700"
          }`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 rounded-md text-xs font-bold transition ${
            editor.isActive("heading", { level: 3 })
              ? "bg-cyan-500 text-white"
              : "hover:bg-slate-100 text-slate-700"
          }`}
          title="Heading 3"
        >
          H3
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1" />

        {/* Text Formats */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg transition ${
            editor.isActive("bold") ? "bg-cyan-100 text-cyan-800 font-bold" : "hover:bg-slate-100"
          }`}
          title="Tebal (Bold)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg transition ${
            editor.isActive("italic") ? "bg-cyan-100 text-cyan-800" : "hover:bg-slate-100"
          }`}
          title="Miring (Italic)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded-lg transition ${
            editor.isActive("underline") ? "bg-cyan-100 text-cyan-800" : "hover:bg-slate-100"
          }`}
          title="Garis Bawah (Underline)"
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded-lg transition ${
            editor.isActive("strike") ? "bg-cyan-100 text-cyan-800" : "hover:bg-slate-100"
          }`}
          title="Coret (Strikethrough)"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`p-1.5 rounded-lg transition ${
            editor.isActive("highlight") ? "bg-amber-100 text-amber-800" : "hover:bg-slate-100"
          }`}
          title="Stabilo (Highlight)"
        >
          <Highlighter className="w-3.5 h-3.5 text-amber-500" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-1.5 rounded-lg transition ${
            editor.isActive("code") ? "bg-cyan-100 text-cyan-800" : "hover:bg-slate-100"
          }`}
          title="Kode Inline"
        >
          <Code className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1" />

        {/* Alignments */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-1.5 rounded-lg transition ${
            editor.isActive({ textAlign: "left" }) ? "bg-cyan-100 text-cyan-800 font-bold" : "hover:bg-slate-100"
          }`}
          title="Rata Kiri"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-1.5 rounded-lg transition ${
            editor.isActive({ textAlign: "center" }) ? "bg-cyan-100 text-cyan-800 font-bold" : "hover:bg-slate-100"
          }`}
          title="Rata Tengah"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-1.5 rounded-lg transition ${
            editor.isActive({ textAlign: "right" }) ? "bg-cyan-100 text-cyan-800 font-bold" : "hover:bg-slate-100"
          }`}
          title="Rata Kanan"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={`p-1.5 rounded-lg transition ${
            editor.isActive({ textAlign: "justify" }) ? "bg-cyan-100 text-cyan-800 font-bold" : "hover:bg-slate-100"
          }`}
          title="Rata Kiri Kanan"
        >
          <AlignJustify className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1" />

        {/* Lists & Quotes */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-lg transition ${
            editor.isActive("bulletList") ? "bg-cyan-100 text-cyan-800 font-bold" : "hover:bg-slate-100"
          }`}
          title="Daftar Bullet"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-lg transition ${
            editor.isActive("orderedList") ? "bg-cyan-100 text-cyan-800 font-bold" : "hover:bg-slate-100"
          }`}
          title="Daftar Nomor"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded-lg transition ${
            editor.isActive("blockquote") ? "bg-cyan-100 text-cyan-800 font-bold" : "hover:bg-slate-100"
          }`}
          title="Kutipan (Quote)"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Editor Canvas Area */}
      <div className="flex-1 bg-white/70 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
