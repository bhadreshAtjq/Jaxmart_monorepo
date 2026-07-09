'use client';
import React, { useState, useRef } from 'react';
import { 
  FaXmark, FaPlus, FaUserTie, FaMagnifyingGlass, FaCommentDots, 
  FaBoxOpen, FaIndustry, FaCartShopping, FaShieldHalved, FaBolt, 
  FaEllipsis, FaImage, FaCircleCheck 
} from 'react-icons/fa6';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FEEDBACK_AREAS = [
  { name: 'Account Management', icon: FaUserTie },
  { name: 'Search Experience', icon: FaMagnifyingGlass },
  { name: 'Messaging', icon: FaCommentDots },
  { name: 'Products', icon: FaBoxOpen },
  { name: 'Suppliers', icon: FaIndustry },
  { name: 'Online Order', icon: FaCartShopping },
  { name: 'Scam/Fraud', icon: FaShieldHalved },
  { name: 'Platform Features', icon: FaBolt },
  { name: 'Other', icon: FaEllipsis },
];

const CLARIFICATION_OPTIONS: Record<string, string[]> = {
  'Search Experience': ['Result Accuracy', 'Search Functionality', 'Search Speed', 'Other'],
  'Account Management': ['Login/Signup', 'Profile Settings', 'Account Security', 'Other'],
  'Messaging': ['Sending/Receiving', 'Notifications', 'Attachments', 'Other'],
  'Products': ['Product Details', 'Pricing/Availability', 'Categories', 'Other'],
  'Suppliers': ['Supplier Profiles', 'Verification', 'Communication', 'Other'],
  'Online Order': ['Checkout Process', 'Payment', 'Order Tracking', 'Other'],
  'Scam/Fraud': ['Fake Supplier', 'Payment Fraud', 'Suspicious Message', 'Other'],
  'Platform Features': ['UI/UX', 'Performance/Speed', 'New Feature Request', 'Other'],
  'Other': ['General Feedback', 'Bug Report', 'Suggestion', 'Other'],
};

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [area, setArea] = useState<string>('');
  const [clarification, setClarification] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isHoveringDropzone, setIsHoveringDropzone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!area) {
      toast.error('Please select a feedback area');
      return;
    }
    if (CLARIFICATION_OPTIONS[area] && !clarification) {
      toast.error('Please select a clarification');
      return;
    }
    if (!feedback.trim()) {
      toast.error('Please provide your feedback');
      return;
    }
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    
    // Process form...
    toast.success('Thank you for your feedback!');
    setTimeout(() => {
      onClose();
      // Reset form
      setArea('');
      setClarification('');
      setFeedback('');
      setEmail('');
      setFile(null);
    }, 500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10 MB limit');
        return;
      }
      setFile(selectedFile);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop with animated blur */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="absolute inset-0 bg-gray-900/40"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-3xl bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden relative max-h-[90vh] flex flex-col z-10"
          >
            {/* Decorative Top Gradient */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#232F72] via-[#36ADA3] to-[#232F72]" />

            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-20">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Help us improve JaxMart</h2>
                <p className="text-sm font-medium text-gray-500 mt-1">We value your feedback to make our platform better.</p>
              </div>
              <button 
                onClick={onClose} 
                className="h-10 w-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-300"
              >
                <FaXmark className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
              <form id="feedback-form" onSubmit={handleSubmit} className="space-y-8">
                
                {/* 1. Feedback Area Selection */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xs font-bold">1</div>
                    <label className="text-base font-black text-gray-900">
                      What is your feedback about? <span className="text-red-500 ml-0.5">*</span>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {FEEDBACK_AREAS.map((item) => {
                      const Icon = item.icon;
                      const isSelected = area === item.name;
                      return (
                        <label 
                          key={item.name} 
                          className={clsx(
                            "group relative flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 overflow-hidden",
                            isSelected 
                              ? "border-[#36ADA3] bg-[#36ADA3]/5 shadow-[0_4px_20px_-8px_rgba(54,173,163,0.3)]" 
                              : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                          )}
                        >
                          <input 
                            type="radio" 
                            name="feedbackArea" 
                            value={item.name}
                            checked={isSelected}
                            onChange={() => {
                              setArea(item.name);
                              setClarification(''); // Reset clarification when area changes
                            }}
                            className="hidden"
                          />
                          <div className={clsx(
                            "h-8 w-8 rounded-xl flex items-center justify-center mb-3 transition-colors duration-300",
                            isSelected ? "bg-[#36ADA3] text-white shadow-md shadow-[#36ADA3]/20" : "bg-gray-100 text-gray-500 group-hover:bg-white group-hover:shadow-sm"
                          )}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className={clsx(
                            "text-sm font-bold transition-colors duration-300",
                            isSelected ? "text-gray-900" : "text-gray-600 group-hover:text-gray-900"
                          )}>
                            {item.name}
                          </span>

                          {/* Selected checkmark indicator */}
                          <div className={clsx(
                            "absolute top-4 right-4 transition-all duration-300",
                            isSelected ? "opacity-100 scale-100 text-[#36ADA3]" : "opacity-0 scale-50"
                          )}>
                            <FaCircleCheck className="h-5 w-5" />
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 1.5 Clarifications (Dynamic) */}
                <AnimatePresence>
                  {area && CLARIFICATION_OPTIONS[area] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 pb-1">
                        <div className="flex items-center gap-2 mb-3">
                          <label className="text-base font-black text-gray-900 flex items-center gap-1.5">
                            <span className="text-red-500">*</span> Clarifications
                          </label>
                        </div>
                        
                        <div className="flex flex-wrap gap-x-6 gap-y-3 pl-4">
                          {CLARIFICATION_OPTIONS[area].map((option) => {
                            const isSelected = clarification === option;
                            return (
                              <label key={option} className="flex items-center gap-2.5 cursor-pointer group">
                                <div className={clsx(
                                  "w-4 h-4 rounded-full border-[2.5px] flex items-center justify-center transition-colors duration-300",
                                  isSelected ? "border-[#e31837]" : "border-gray-300 group-hover:border-[#e31837]/50"
                                )}>
                                  {isSelected && <div className="w-2 h-2 rounded-full bg-[#e31837]" />}
                                </div>
                                <input 
                                  type="radio" 
                                  name="clarification" 
                                  value={option}
                                  checked={isSelected}
                                  onChange={() => setClarification(option)}
                                  className="hidden"
                                />
                                <span className={clsx(
                                  "text-sm font-bold transition-colors duration-300",
                                  isSelected ? "text-[#e31837]" : "text-gray-600 group-hover:text-gray-900"
                                )}>{option}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 2. Detailed Feedback */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xs font-bold">2</div>
                    <label className="text-base font-black text-gray-900">
                      Share your thoughts <span className="text-red-500 ml-0.5">*</span>
                    </label>
                  </div>
                  <div className="relative group/textarea">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#36ADA3] to-[#232F72] rounded-2xl opacity-0 group-focus-within/textarea:opacity-20 transition duration-500 blur" />
                    <div className="relative bg-white rounded-2xl border-2 border-gray-100 focus-within:border-[#36ADA3] transition-colors duration-300 overflow-hidden shadow-sm flex flex-col">
                      <textarea
                        value={feedback}
                        onChange={(e) => {
                          if (e.target.value.length <= 2000) {
                            setFeedback(e.target.value);
                          }
                        }}
                        placeholder="What did you love? What could we do better? Please be as detailed as possible."
                        className="w-full h-40 p-5 outline-none resize-none text-[15px] font-medium text-gray-800 placeholder:text-gray-400 bg-transparent"
                      />
                      <div className="px-5 py-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          Markdown supported
                        </span>
                        <span className={clsx(
                          "text-xs font-bold transition-colors",
                          feedback.length > 1900 ? "text-red-500" : "text-gray-400"
                        )}>
                          {feedback.length} <span className="opacity-50">/ 2000</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Contact & Attachments Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xs font-bold">3</div>
                      <label className="text-base font-black text-gray-900">
                        Email Address <span className="text-red-500 ml-0.5">*</span>
                      </label>
                    </div>
                    <div className="relative group/input">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#36ADA3] to-[#232F72] rounded-xl opacity-0 group-focus-within/input:opacity-20 transition duration-500 blur" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="relative w-full h-14 px-5 border-2 border-gray-100 rounded-xl focus:border-[#36ADA3] outline-none text-[15px] font-medium text-gray-800 placeholder:text-gray-400 bg-white shadow-sm transition-colors duration-300"
                      />
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-2 ml-1">We'll only use this to reply to your feedback.</p>
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-500 text-xs font-bold">4</div>
                      <label className="text-base font-black text-gray-900">
                        Attach a Screenshot <span className="text-gray-400 text-sm font-semibold ml-1">(Optional)</span>
                      </label>
                    </div>
                    
                    <input
                      type="file"
                      accept="image/jpeg, image/png"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    <div 
                      onClick={() => !file && fileInputRef.current?.click()}
                      onMouseEnter={() => setIsHoveringDropzone(true)}
                      onMouseLeave={() => setIsHoveringDropzone(false)}
                      className={clsx(
                        "relative h-14 border-2 border-dashed rounded-xl flex items-center px-4 transition-all duration-300",
                        file ? "border-[#36ADA3] bg-[#36ADA3]/5" : "border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-[#36ADA3]/50 cursor-pointer"
                      )}
                    >
                      {file ? (
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="h-8 w-8 rounded-lg bg-[#36ADA3]/10 text-[#36ADA3] flex items-center justify-center shrink-0">
                              <FaImage className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-bold text-gray-700 truncate">{file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                            className="h-8 w-8 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition-colors shrink-0 shadow-sm"
                          >
                            <FaXmark className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 w-full">
                          <div className={clsx(
                            "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-300",
                            isHoveringDropzone ? "bg-[#36ADA3] text-white" : "bg-white border border-gray-200 text-gray-400 shadow-sm"
                          )}>
                            <FaPlus className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-700">Upload image</span>
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">JPG/PNG up to 10MB</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </form>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3 rounded-b-3xl shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="h-12 px-8 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition-all duration-300 shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="feedback-form"
                className="h-12 px-10 bg-gradient-to-r from-[#232F72] to-[#2F578A] hover:from-[#1C265B] hover:to-[#244774] text-white font-bold rounded-xl transition-all duration-300 shadow-[0_8px_20px_-8px_rgba(35,47,114,0.5)] hover:shadow-[0_12px_25px_-8px_rgba(35,47,114,0.6)] hover:-translate-y-0.5 active:translate-y-0"
              >
                Submit Feedback
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
