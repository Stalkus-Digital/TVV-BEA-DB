import React, { useId } from "react";
import { UploadCloud } from "lucide-react";

interface ImageUploaderProps {
  label: string;
  multiple?: boolean;
  maxFiles?: number;
  hint?: string;
  value?: (File | string)[];
  onChange: (files: (File | string)[]) => void;
}

export function ImageUploader({
  label,
  multiple = false,
  maxFiles,
  hint,
  value = [],
  onChange,
}: ImageUploaderProps) {
  const generatedId = useId();
  const id = label ? label.replace(/\s+/g, "-").toLowerCase() : generatedId;
  const currentValues = Array.isArray(value) ? value : [];
  const atLimit = typeof maxFiles === "number" && currentValues.length >= maxFiles;

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <label
        htmlFor={atLimit ? undefined : id}
        className={`border border-border border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50/50 transition-colors group ${
          atLimit ? "opacity-60 cursor-not-allowed" : "hover:bg-slate-50 cursor-pointer"
        }`}
      >
        <UploadCloud className="h-8 w-8 text-muted-foreground mb-3 group-hover:text-primary transition-colors" />
        <div className="text-sm">
          <span className="text-primary font-medium group-hover:underline">
            Choose file{multiple ? "s" : ""}
          </span>
          <span className="text-muted-foreground">
            {currentValues.length > 0 ? (
              <span className="ml-2 text-slate-800">
                {currentValues.length}
                {typeof maxFiles === "number" ? ` / ${maxFiles}` : ""} file
                {currentValues.length > 1 ? "s" : ""} selected
              </span>
            ) : (
              " No file chosen"
            )}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          PNG, JPG, GIF up to 5MB
          {typeof maxFiles === "number" ? ` · max ${maxFiles}` : ""}
        </p>
      </label>
      <input
        id={id}
        type="file"
        multiple={multiple}
        className="hidden"
        accept="image/*"
        disabled={atLimit}
        onChange={(e) => {
          if (!e.target.files) return;
          const newFiles = Array.from(e.target.files);
          const merged = multiple ? [...currentValues, ...newFiles] : newFiles;
          onChange(typeof maxFiles === "number" ? merged.slice(0, maxFiles) : merged);
          e.target.value = "";
        }}
      />

      {currentValues.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {currentValues.map((file, i) => {
            const isString = typeof file === "string";
            const fileUrl = isString ? file : URL.createObjectURL(file);
            const fileName = isString ? file.split("/").pop() : file.name;

            return (
              <div
                key={i}
                className="relative group rounded-lg overflow-hidden border border-border bg-slate-50 aspect-square"
              >
                {i === 0 && (
                  <span className="absolute top-2 left-2 z-10 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                    Main
                  </span>
                )}
                <img
                  src={fileUrl}
                  alt={fileName || "Uploaded image"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <span className="text-white text-xs truncate drop-shadow-md font-medium">
                    {fileName}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      onChange(currentValues.filter((_, idx) => idx !== i));
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded self-end shadow-sm transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
