"use client";

import React, { useState, useRef } from "react";
import { Upload, Download, X, FileSpreadsheet, Loader2, CheckCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "HOTEL" | "ACTIVITY";
}

export function BulkImportModal({ isOpen, onClose, type }: BulkImportModalProps) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    window.location.href = `/api/admin/inventory/template?type=${type}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setErrorMsg("");
      setSuccessMsg("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMsg("Please select a file first.");
      return;
    }

    setIsUploading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
      const res = await fetch("/api/admin/inventory/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMsg(data.message || `Successfully imported items!`);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        
        // Refresh the inventory list
        queryClient.invalidateQueries({ queryKey: ["admin", "inventory", type] });
        
        // Auto close after 2 seconds
        setTimeout(() => {
          onClose();
          setSuccessMsg("");
        }, 2000);
      } else {
        setErrorMsg(data.error || "Failed to upload file.");
      }
    } catch (err) {
      setErrorMsg("Network error during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={() => !isUploading && onClose()} 
      />
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Bulk Import {type === 'HOTEL' ? 'Hotels' : 'Activities'}
          </h3>
          <button 
            onClick={onClose} 
            disabled={isUploading}
            className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Step 1: Download */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">Step 1: Download Template</h4>
            <p className="text-xs text-blue-700/80 mb-3">
              Download the official format, fill in your data, and save it as an Excel (.xlsx) or CSV file.
            </p>
            <button 
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 text-xs font-bold text-blue-700 bg-white border border-blue-200 px-3 py-1.5 rounded-md shadow-sm hover:bg-blue-50 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download {type} Format
            </button>
          </div>

          {/* Step 2: Upload */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Step 2: Upload File</h4>
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                file ? 'border-primary/50 bg-primary/5' : 'border-slate-200 hover:border-primary/30 hover:bg-slate-50'
              }`}
            >
              <input 
                type="file" 
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              
              {!file ? (
                <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mb-1">
                    <Upload className="h-5 w-5 text-slate-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Click to select file</p>
                  <p className="text-xs text-slate-500">Supports .CSV and .XLSX</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm font-bold text-slate-900 truncate max-w-full">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                  <button 
                    onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="text-xs font-medium text-red-500 hover:text-red-600 mt-1"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Status Messages */}
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100 flex items-start gap-2">
              <X className="h-4 w-4 mt-0.5 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}
          
          {successMsg && (
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-md text-sm border border-emerald-100 flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>{successMsg}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:hover:bg-primary transition-colors shadow-sm"
          >
            {isUploading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
            ) : (
              <><Upload className="h-4 w-4" /> Import Data</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
