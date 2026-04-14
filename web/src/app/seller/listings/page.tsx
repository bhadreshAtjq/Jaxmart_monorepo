'use client';
import { 
  FaPlus, FaPenToSquare, FaTrash, 
  FaArrowUpRightFromSquare, FaCubes, FaFilter,
  FaMagnifyingGlass, FaIndustry, FaBoxOpen, FaFileCsv, FaUpload, FaCircleCheck, FaXmark
} from 'react-icons/fa6';
import { useState, useRef } from 'react';
import { listingApi } from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, Badge, Button, PageLoader, EmptyState, Container } from '@/components/ui';
import { useMyListings } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function SellerListingsPage() {
  const router = useRouter();
  const { data: listings, isLoading } = useMyListings();
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  if (isLoading) return <AppLayout><PageLoader /></AppLayout>;
  const items = listings?.listings ?? [];

  return (
    <AppLayout>
      <AnimatePresence>
        {isBulkOpen && (
          <BulkImportModal 
            onClose={() => setIsBulkOpen(false)} 
            onSuccess={() => {
              setIsBulkOpen(false);
              router.refresh(); // Or reload via mutate
            }}
          />
        )}
      </AnimatePresence>

      <div className="bg-white border-b border-gray-100 mb-8">
        <Container size="xl" className="py-8">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                   <FaIndustry className="text-jax-accent h-3 w-3" />
                   <span className="text-[10px] font-black text-jax-accent uppercase tracking-[0.2em]">Supplier Inventory Management</span>
                </div>
                <h1 className="text-3xl font-heading font-black text-jax-dark tracking-tighter uppercase leading-none mb-2">My Sourcing Catalog</h1>
                <p className="text-sm text-gray-500 font-medium">Control your active factory output and global distribution listings.</p>
              </div>
              
              <div className="flex items-center gap-4">
                 <div className="hidden md:flex items-center gap-8 px-8 py-3 bg-gray-50 rounded-2xl border border-gray-100 mr-2">
                    <div>
                       <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 text-right">Active SKUs</p>
                       <p className="text-xl font-black text-jax-dark text-right leading-none">{items.length}</p>
                    </div>
                 </div>
                 <Button id="bulk-import-btn" variant="outline" className="h-14 px-8 border-gray-200 text-gray-500 font-black uppercase tracking-widest text-[10px]" icon={<FaFileCsv />} onClick={() => setIsBulkOpen(true)}>
                    Bulk Import
                 </Button>
                 <Button id="add-listing-btn" className="h-14 px-8 bg-jax-accent text-white border-none shadow-xl shadow-jax-accent/20 font-black uppercase tracking-widest text-[10px]" icon={<FaPlus />} onClick={() => router.push('/seller/listings/new')}>
                    Add New Product
                 </Button>
              </div>
           </div>
        </Container>
      </div>

      <Container size="xl" className="pb-24">
        {!items.length ? (
          <EmptyState
            icon={<FaBoxOpen className="h-12 w-12 text-gray-200" />}
            title="Registry Empty"
            description="Your supplier catalog currently has no indexed products. Start broadcasting your capabilities to the marketplace."
            action={<Button className="h-12 px-10 bg-jax-dark text-white" onClick={() => router.push('/seller/listings/new')}>Initial SKU Upload</Button>}
          />
        ) : (
          <div className="space-y-6">
             <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-8">
                   <h2 className="text-[10px] font-black text-jax-dark uppercase tracking-[0.2em] flex items-center gap-2">
                      <FaCubes className="text-jax-accent" /> Active Inventory Ledger
                   </h2>
                </div>
                <div className="flex items-center gap-4">
                   <div className="relative group">
                      <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                      <input placeholder="Filter SKUs..." className="h-10 bg-white border border-gray-200 rounded-xl pl-9 pr-4 text-[10px] font-black uppercase outline-none focus:border-jax-accent w-48 shadow-sm" />
                   </div>
                </div>
             </div>

             <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-xl shadow-black/[0.02]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      {['Product / SKU Details', 'Market Segment', 'Commercial Quote', 'Registry Status', 'Management'].map((h, i) => (
                        <th key={h} className={`px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest ${i === 4 ? 'text-right' : ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {items.map((l: any, i: number) => (
                      <motion.tr 
                        key={l.id} 
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-gray-50/50 transition-colors group"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-5">
                            <div className="h-14 w-14 rounded-2xl bg-white overflow-hidden border border-gray-100 shadow-sm shrink-0 flex items-center justify-center">
                              {l.media?.[0] ? 
                                <img src={l.media[0].url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" /> : 
                                <FaCubes className="h-5 w-5 text-gray-200" />
                              }
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-jax-dark uppercase tracking-tight text-sm group-hover:text-jax-accent transition-colors truncate max-w-[280px]">{l.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                 <Badge status={l.listingType} className="text-[8px] bg-jax-blue/5 text-jax-blue border-none" />
                                 <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">ID: #{l.id.slice(0, 8)}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{l.category?.name}</span>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-base font-heading font-black text-jax-dark tracking-tighter">
                            {l.productDetail?.priceOnRequest ? 
                              <span className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Quote Req</span> : 
                              `₹${l.productDetail?.pricePerUnit?.toLocaleString() || '-'}`
                            }
                          </p>
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Per {l.productDetail?.unitOfMeasure || 'Unit'}</p>
                        </td>
                        <td className="px-8 py-6">
                           <Badge status={l.status} className="text-[8px]" />
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => router.push(`/listings/${l.id}`)} className="h-9 w-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-jax-blue hover:bg-jax-blue/5 transition-all"><FaArrowUpRightFromSquare className="h-4 w-4" /></button>
                            <button className="h-9 w-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-jax-accent hover:bg-jax-accent/5 transition-all"><FaPenToSquare className="h-4 w-4" /></button>
                            <button onClick={() => toast.error('Shielded: Cannot delete active inventory')} className="h-9 w-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"><FaTrash className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        )}
      </Container>
    </AppLayout>
  );
}

function BulkImportModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadExampleCSV = () => {
    const headers = 'Title,Description,CategoryID,Price,SKU\n';
    const example = 'Industrial Pump G-40,High pressure heavy duty pump,CAT-123,45000,SKU-HP-001\n';
    const blob = new Blob([headers + example], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jaxmart_sku_template.csv';
    a.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const data = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',');
          return {
            title: values[0]?.trim(),
            description: values[1]?.trim(),
            categoryId: values[2]?.trim(),
            pricePerUnit: parseFloat(values[3]?.trim()) || 0,
            sku: values[4]?.trim() || '',
            listingType: 'PRODUCT'
          };
        });
        setPreviewData(data);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (previewData.length === 0) return;
    setIsLoading(true);
    try {
      await listingApi.bulkCreate(previewData);
      toast.success(`Successfully indexed ${previewData.length} records`);
      onSuccess();
    } catch (err) {
      toast.error('Bulk upload failed. Verify data format.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-jax-dark/60 backdrop-blur-xl" 
        onClick={onClose} 
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-jax-accent/10 flex items-center justify-center text-jax-accent">
              <FaFileCsv className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-black text-jax-dark uppercase tracking-tight">Bulk Inventory Synchronization</h2>
              <div className="flex items-center gap-3 mt-1">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Format: Title, Description, CategoryID, Price, SKU</p>
                 <button onClick={downloadExampleCSV} className="text-[9px] font-black text-jax-blue uppercase tracking-widest underline hover:text-jax-accent transition-colors">Download Sample Template</button>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
            <FaXmark className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10">
          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-4 border-dashed border-gray-100 rounded-[3rem] p-20 flex flex-col items-center justify-center text-center cursor-pointer hover:border-jax-accent/20 hover:bg-jax-accent/[0.02] transition-all group"
            >
              <div className="h-20 w-20 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-300 mb-6 group-hover:scale-110 group-hover:bg-jax-accent group-hover:text-white transition-all duration-500">
                <FaUpload className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-heading font-black text-jax-dark uppercase mb-2">Initialize Data Stream</h3>
              <p className="text-xs text-gray-400 font-medium max-w-xs mx-auto mb-8">Drag your product CSV here or click to browse. Ensure Category IDs match the global registry.</p>
              <Button variant="outline" className="h-12 px-10 border-gray-200">Select CSV File</Button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-6 rounded-3xl">
                  <div className="flex items-center gap-4">
                     <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-white"><FaCircleCheck /></div>
                     <div>
                        <p className="text-xs font-black text-emerald-900 uppercase tracking-tight">{file.name}</p>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none">Payload Decoded: {previewData.length} records identified</p>
                     </div>
                  </div>
                  <button onClick={() => setFile(null)} className="text-[10px] font-black text-emerald-700 uppercase tracking-widest underline hover:text-emerald-900">Change File</button>
               </div>

               <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['Title', 'Category ID', 'Price', 'SKU'].map(h => (
                          <th key={h} className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {previewData.slice(0, 10).map((row, i) => (
                        <tr key={i} className="text-[11px] font-semibold text-jax-dark">
                          <td className="px-6 py-4 truncate max-w-[200px]">{row.title}</td>
                          <td className="px-6 py-4 text-gray-400 font-bold">{row.categoryId}</td>
                          <td className="px-6 py-4 font-black">₹{row.pricePerUnit}</td>
                          <td className="px-6 py-4">#{row.sku}</td>
                        </tr>
                      ))}
                      {previewData.length > 10 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest italic bg-gray-50/30">
                            + {previewData.length - 10} additional records suppressed from preview
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
               </div>
            </div>
          )}
        </div>

        {file && (
          <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
             <Button variant="outline" className="h-12 px-8 border-gray-200" onClick={onClose} disabled={isLoading}>Cancel</Button>
             <Button className="h-12 px-12 bg-jax-accent text-white border-none shadow-xl shadow-jax-accent/20 font-black uppercase tracking-widest text-[10px]" loading={isLoading} onClick={handleUpload}>
                Execute Synchronization
             </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
