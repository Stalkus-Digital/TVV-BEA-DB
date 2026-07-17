"use client";

import { useCallback, useMemo, useRef } from "react";
import ReactQuill from "react-quill-new";
import { uploadFile } from "@/lib/admin-api/upload";
import "react-quill-new/dist/quill.snow.css";

const FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "code-block",
  "list",
  "indent",
  "link",
  "image",
  "video",
  "color",
  "background",
  "align",
];

export interface CmsRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CmsRichTextEditorInner({
  value,
  onChange,
  placeholder = "Write your guide content…",
}: CmsRichTextEditorProps) {
  const quillRef = useRef<ReactQuill | null>(null);
  const uploadingRef = useRef(false);

  const imageHandler = useCallback(() => {
    if (uploadingRef.current) return;

    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/png,image/jpeg,image/jpg,image/gif,image/webp");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const editor = quillRef.current?.getEditor();
      if (!editor) return;

      const range = editor.getSelection(true);
      const insertIndex = range?.index ?? editor.getLength();
      const placeholderText = "Uploading image…";

      try {
        uploadingRef.current = true;
        editor.insertText(insertIndex, placeholderText, "italic", true);
        const result = await uploadFile(file, "GALLERY_IMAGE");
        editor.deleteText(insertIndex, placeholderText.length);
        editor.insertEmbed(insertIndex, "image", result.url);
        editor.setSelection(insertIndex + 1, 0);
      } catch {
        try {
          editor.deleteText(insertIndex, placeholderText.length);
        } catch {
          /* ignore */
        }
        window.alert("Failed to upload image. Please try again.");
      } finally {
        uploadingRef.current = false;
      }
    };
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          ["blockquote", "code-block"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
          ["link", "image", "video"],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    [imageHandler]
  );

  return (
    <div className="cms-rich-text-editor rounded-md border border-input bg-white overflow-hidden">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={FORMATS}
        placeholder={placeholder}
      />
      <style>{`
        .cms-rich-text-editor .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid #cbd5e1;
          background: #f8fafc;
        }
        .cms-rich-text-editor .ql-container.ql-snow {
          border: none;
          font-size: 15px;
          min-height: 320px;
          color: #0f172a;
        }
        .cms-rich-text-editor .ql-editor {
          min-height: 320px;
          line-height: 1.65;
        }
        .cms-rich-text-editor .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
        }
        .cms-rich-text-editor .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
        }
        .cms-rich-text-editor .ql-snow .ql-stroke {
          stroke: #475569;
        }
        .cms-rich-text-editor .ql-snow .ql-fill {
          fill: #475569;
        }
        .cms-rich-text-editor .ql-snow .ql-picker {
          color: #334155;
        }
      `}</style>
    </div>
  );
}
