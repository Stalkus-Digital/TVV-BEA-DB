import React from "react";
import { UploadCloud } from "lucide-react";

interface ImageUploaderProps {
  label: string;
  multiple?: boolean;
  value?: (File | string)[];
  onChange: (files: any[]) => void;
}

export function ImageUploader({ label, multiple = false, value = [], onChange }: ImageUploaderProps) {
  const id = label.replace(/\s+/g, '-').toLowerCase();
  
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <label htmlFor={id} className="border border-border border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group">
        <UploadCloud className="h-8 w-8 text-muted-foreground mb-3 group-hover:text-primary transition-colors" />
        <div className="text-sm">
          <span className="text-primary font-medium group-hover:underline">
            Choose file{multiple ? "s" : ""}
          </span>
          <span className="text-muted-foreground"> 
            {(value && Array.isArray(value) ? value : []).length > 0 ? (
              <span className="ml-2 text-slate-800">{(value && Array.isArray(value) ? value : []).length} file{(value && Array.isArray(value) ? value : []).length > 1 ? "s" : ""} selected</span>
            ) : " No file chosen"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 5MB</p>
      </label>
      <input
        id={id}
        type="file"
        multiple={multiple}
        className="sr-only"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const currentValues = Array.isArray(value) ? value : [];
            onChange(multiple ? [...currentValues, ...newFiles] : newFiles);
          }
        }}
      />
      
      {(value && Array.isArray(value) ? value : []).length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {(value && Array.isArray(value) ? value : []).map((file, i) => {
            const isString = typeof file === "string";
            const fileUrl = isString ? file : URL.createObjectURL(file);
            const fileName = isString ? file.split("/").pop() : file.name;
            
            return (
              <div key={i} className="relative group rounded-lg overflow-hidden border border-border bg-slate-50 aspect-square">
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
                      onChange(value.filter((_, idx) => idx !== i));
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
