"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { useState, useCallback } from "react";

interface ReportEditorProps {
  content: string;
  onSave: (editedContent: string) => void;
  onCopy: () => void;
  aiRewrite?: (selectedText: string) => Promise<string>;
}

export default function ReportEditor({ content, onSave, onCopy, aiRewrite }: ReportEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [rewriting, setRewriting] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder: "AI 生成的内容会出现在这里..." }),
    ],
    content,
    editable: true,
  });

  const handleSave = useCallback(() => {
    if (editor) {
      onSave(editor.getHTML());
      setIsEditing(false);
    }
  }, [editor, onSave]);

  const handleAIRewrite = useCallback(async () => {
    if (!editor || !aiRewrite) return;
    const { from, to } = editor.state.selection;
    if (from === to) return; // 没有选中文本

    const selectedText = editor.state.doc.textBetween(from, to);
    if (!selectedText.trim()) return;

    setRewriting(true);
    try {
      const rewritten = await aiRewrite(selectedText);
      editor.chain().focus().deleteSelection().insertContent(rewritten).run();
    } catch (e) {
      console.error("AI 改写失败:", e);
    } finally {
      setRewriting(false);
    }
  }, [editor, aiRewrite]);

  const handleMarkGood = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().toggleHighlight({ color: "rgba(45, 122, 58, 0.3)" }).run();
  }, [editor]);

  const handleMarkBad = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().toggleHighlight({ color: "rgba(194, 59, 34, 0.3)" }).run();
  }, [editor]);

  const handleCopyPlainText = useCallback(() => {
    if (!editor) return;
    const text = editor.getText();
    navigator.clipboard.writeText(text).then(() => {
      onCopy();
    });
  }, [editor, onCopy]);

  return (
    <div className="space-y-3">
      {/* 工具栏 */}
      <div className="flex items-center gap-2 flex-wrap">
        {aiRewrite && (
          <button
            onClick={handleAIRewrite}
            disabled={rewriting}
            className="btn-secondary text-xs !py-1 !px-3"
          >
            {rewriting ? "改写中..." : "AI 改写选中文字"}
          </button>
        )}
        <button onClick={handleMarkGood} className="text-xs px-3 py-1 rounded" style={{ backgroundColor: "rgba(45, 122, 58, 0.1)", color: "var(--wood)" }}>
          标记好句
        </button>
        <button onClick={handleMarkBad} className="text-xs px-3 py-1 rounded" style={{ backgroundColor: "rgba(194, 59, 34, 0.1)", color: "var(--fire)" }}>
          标记禁句
        </button>
        <div className="flex-1" />
        <button onClick={handleCopyPlainText} className="btn-gold text-xs !py-1 !px-3">
          复制到微信
        </button>
        <button onClick={handleSave} className="btn-primary text-xs !py-1 !px-3">
          保存修改
        </button>
      </div>

      {/* 编辑器 */}
      <div
        className="card min-h-[300px] prose prose-sm max-w-none"
        style={{ color: "var(--text-primary)" }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* 提示 */}
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        提示：选中文字后可使用"AI 改写"或"标记好句/禁句"。绿色高亮=好句，红色高亮=禁句。
      </p>
    </div>
  );
}
