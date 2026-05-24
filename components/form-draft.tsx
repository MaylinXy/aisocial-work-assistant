"use client";

import { useEffect, useRef, useState } from "react";

type FormDraftProps = {
  storageKey: string;
  fields: string[];
};

export function FormDraft({ storageKey, fields }: FormDraftProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("填写内容会自动暂存到本机浏览器");

  useEffect(() => {
    const form = rootRef.current?.closest("form");
    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("saved")) {
      localStorage.removeItem(storageKey);
      setStatus("已保存，暂存内容已清除");
      return;
    }

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const draft = JSON.parse(saved) as Record<string, string>;
        fields.forEach((field) => {
          const element = form.elements.namedItem(field);
          if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) {
            element.value = draft[field] ?? element.value;
          }
        });
        setStatus("已恢复上次未提交的暂存内容");
      } catch {
        localStorage.removeItem(storageKey);
      }
    }

    let timer: number | undefined;
    const saveDraft = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const draft: Record<string, string> = {};
        fields.forEach((field) => {
          const element = form.elements.namedItem(field);
          if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) {
            draft[field] = element.value;
          }
        });
        localStorage.setItem(storageKey, JSON.stringify(draft));
        setStatus(`已自动暂存 ${new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`);
      }, 350);
    };

    form.addEventListener("input", saveDraft);
    form.addEventListener("change", saveDraft);

    return () => {
      window.clearTimeout(timer);
      form.removeEventListener("input", saveDraft);
      form.removeEventListener("change", saveDraft);
    };
  }, [fields, storageKey]);

  function clearDraft() {
    localStorage.removeItem(storageKey);
    setStatus("已清除本机暂存内容");
  }

  return (
    <div className="draft-status" ref={rootRef}>
      <span>{status}</span>
      <button type="button" onClick={clearDraft}>清除暂存</button>
    </div>
  );
}
