
'use client';
import React, { useRef, useState } from 'react';
import { FaCloudArrowUp, FaCircleCheck, FaTrash, FaSpinner } from 'react-icons/fa6';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import axios from 'axios';

interface ImageUploadProps {
  onUpload: (urls: string[]) => void;
  maxFiles?: number;
}

export function ImageUpload({ onUpload, maxFiles = 5 }: ImageUploadProps) {
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    if (images.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload/multiple`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // simple token retrieval
        }
      });
      
      const newUrls = response.data.map((f: any) => f.url);
      const updatedImages = [...images, ...newUrls];
      setImages(updatedImages);
      onUpload(updatedImages);
      toast.success('Visual assets synchronized');
    } catch (err) {
      toast.error('Protocol upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => {
    const updated = images.filter(i => i !== url);
    setImages(updated);
    onUpload(updated);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((url, idx) => (
          <div key={idx} className="relative aspect-square rounded-3xl overflow-hidden border border-gray-100 group animate-in zoom-in duration-300">
            <img src={url} alt="Listing" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-jax-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button 
                onClick={() => removeImage(url)}
                className="h-10 w-10 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
              >
                <FaTrash className="h-4 w-4" />
              </button>
            </div>
            {idx === 0 && (
              <div className="absolute top-2 left-2 px-2 py-1 bg-jax-accent text-white text-[8px] font-black uppercase tracking-widest rounded-md">
                Primary
              </div>
            )}
          </div>
        ))}
        
        {images.length < maxFiles && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-square border-2 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center p-6 bg-gray-50/50 hover:bg-gray-50 hover:border-jax-accent/30 transition-all group relative overflow-hidden"
          >
            {uploading ? (
              <FaSpinner className="h-6 w-6 text-jax-blue animate-spin" />
            ) : (
              <>
                <div className="h-12 w-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-300 group-hover:bg-jax-accent group-hover:text-white transition-all mb-3">
                  <FaCloudArrowUp className="h-6 w-6" />
                </div>
                <p className="text-[10px] font-black text-jax-dark uppercase tracking-tight text-center">Add Visual Asset</p>
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-1 text-center">Max 5MB per file</p>
              </>
            )}
          </button>
        )}
      </div>

      <input 
        type="file" 
        multiple 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {images.length > 0 && (
        <div className="flex items-center gap-3 p-6 bg-emerald-50 border border-emerald-100/50 rounded-2xl max-w-xl mx-auto animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
            <FaCircleCheck className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-xs font-black text-emerald-800 uppercase tracking-tight">{images.length} Assets Synchronized</p>
            <p className="text-[10px] text-emerald-700/70 font-bold uppercase tracking-widest">Visual data is coherent and ready for registry injection.</p>
          </div>
        </div>
      )}
    </div>
  );
}
