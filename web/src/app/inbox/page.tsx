'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Socket } from 'socket.io-client';
import {
  FaPaperPlane, FaBuilding, FaUser, FaComments, FaArrowLeft,
  FaFileContract, FaBoxesStacked, FaShieldHalved, FaPaperclip,
  FaArrowRight, FaMagnifyingGlass, FaCircleCheck, FaCheckDouble,
  FaCircleDot, FaCircleInfo, FaScaleBalanced, FaLocationDot,
  FaChevronRight, FaAddressCard, FaHandshake, FaIndianRupeeSign,
  FaXmark
} from 'react-icons/fa6';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button, Container, Card, Badge, Avatar, Skeleton, TrustScore } from '@/components/ui';
import { useAuthStore } from '@/lib/store';
import { messageApi, orderApi } from '@/lib/api';
import { useConversations } from '@/lib/hooks';
import { useSocket } from '@/components/providers/SocketProvider';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

// Pre-defined B2B Message Templates for quick buyer communication
const B2B_TEMPLATES = [
  "Interested in your listing. Can you share the latest product catalog & FOB price list?",
  "What is the minimum order quantity (MOQ) for custom branding/OEM?",
  "Could you please share details on shipping cost and delivery time to Mundra port?",
  "Are product samples available for verification? What is the sample cost?"
];

export default function InboxPage() {
  return (
    <Suspense fallback={
      <PublicLayout>
        <Container size="xl" className="py-20 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-12 w-1/3 rounded-xl mx-auto" />
            <Skeleton className="h-64 rounded-[32px]" />
          </div>
        </Container>
      </PublicLayout>
    }>
      <InboxContent />
    </Suspense>
  );
}

function InboxContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, user } = useAuthStore();
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const { socket, isConnected } = useSocket();

  // Conversations query
  const { data: conversations = [], error, isLoading, mutate } = useConversations();

  // Active chat state
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfilePanel, setShowProfilePanel] = useState(true);
  const [showTemplates, setShowTemplates] = useState(true);
  const mutatedRef = useRef(false);
  const isFirstLoadRef = useRef(true);

  // Chat refs
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Direct B2B Deal Center state
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [showProposeForm, setShowProposeForm] = useState(false);
  const [dealQty, setDealQty] = useState('');
  const [dealCustomPrice, setDealCustomPrice] = useState('');
  const [submittingDeal, setSubmittingDeal] = useState(false);
  const [signingDeal, setSigningDeal] = useState(false);

  // Listing context for this conversation
  const [listingData, setListingData] = useState<any>(null);

  // Fetch listing details when conversation has listingId
  useEffect(() => {
    if (!selectedConv) { setListingData(null); return; }
    // Use inline listing data from conversation if available
    if (selectedConv.listing) {
      setListingData(selectedConv.listing);
    } else if (selectedConv.listingId) {
      messageApi.getConversationListing(selectedConv.id)
        .then(({ data }) => setListingData(data))
        .catch(() => setListingData(null));
    } else {
      setListingData(null);
    }
  }, [selectedConv?.id, selectedConv?.listingId]);

  // Fetch active order details when selected conversation's orderId changes
  useEffect(() => {
    if (!selectedConv?.orderId) {
      setActiveOrder(null);
      return;
    }
    const fetchOrderDetails = async () => {
      setLoadingOrder(true);
      try {
        const { data } = await orderApi.get(selectedConv.orderId);
        setActiveOrder(data);
      } catch (err) {
        // silently fail
      } finally {
        setLoadingOrder(false);
      }
    };
    fetchOrderDetails();
  }, [selectedConv?.orderId]);

  // Smart deal proposal handler — auto-calculates from listing context
  const handleProposeDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(dealQty) || 1;
    const unitPrice = dealCustomPrice ? Number(dealCustomPrice) : (listingData?.pricePerUnit || listingData?.productDetail?.pricePerUnit || 0);
    const totalAmount = unitPrice * qty;
    if (totalAmount <= 0) {
      toast.error('Please enter a valid quantity and price');
      return;
    }
    setSubmittingDeal(true);
    try {
      const title = listingData?.title || 'Direct trade contract';
      const { data } = await orderApi.propose({
        conversationId: selectedConv.id,
        totalAmount,
        title: `${qty}x ${title}`,
        orderType: 'PRODUCT'
      });
      toast.success('Deal proposal sent!');
      setShowProposeForm(false);
      setDealQty('');
      setDealCustomPrice('');
      setActiveOrder(data);
      mutate();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to propose deal');
    } finally {
      setSubmittingDeal(false);
    }
  };

  const [rejectingDeal, setRejectingDeal] = useState(false);

  const handleSignContract = async () => {
    if (!activeOrder) return;
    setSigningDeal(true);
    try {
      await orderApi.sign(activeOrder.id);
      toast.success('Contract signed successfully! Order is active.');
      const { data } = await orderApi.get(activeOrder.id);
      setActiveOrder(data);
      mutate();
    } catch (err) {
      toast.error('Failed to sign contract');
    } finally {
      setSigningDeal(false);
    }
  };

  const handleRejectContract = async () => {
    if (!activeOrder) return;
    setRejectingDeal(true);
    try {
      await orderApi.reject(activeOrder.id);
      toast.success('Deal proposal declined.');
      setActiveOrder(null);
      mutate();
    } catch (err) {
      toast.error('Failed to decline deal proposal');
    } finally {
      setRejectingDeal(false);
    }
  };

  // Check login
  useEffect(() => {
    if (!isLoggedIn) {
      toast.error('Please log in to access the Message Center');
      router.push('/auth/login');
    }
  }, [isLoggedIn, router]);

  // Listen for real-time events on global socket
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: any) => {
      // If message belongs to active conversation, append it in real-time
      if (selectedConv && message.conversationId === selectedConv.id) {
        setMessages((prev) => {
          // Replace matching optimistic message if sent by me
          const optimisticIndex = prev.findIndex(
            (m) => m.sending && m.content === message.content && m.senderId === message.senderId
          );
          if (optimisticIndex !== -1) {
            const updated = [...prev];
            updated[optimisticIndex] = message;
            return updated;
          }
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
        socket.emit('mark_read', { conversationId: selectedConv.id });
      }
      mutate();
    };

    const handleNotification = (data: any) => {
      if (data.type === 'new_message') {
        mutate();
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('notification', handleNotification);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('notification', handleNotification);
    };
  }, [socket, selectedConv, mutate]);

  // Load message history on conversation select
  useEffect(() => {
    if (!selectedConv) return;

    const fetchMessageHistory = async () => {
      setLoadingMessages(true);
      try {
        const { data } = await messageApi.getMessages(selectedConv.id);
        setMessages(data);

        // Tell socket we joined this room
        if (socket) {
          socket.emit('join_conversation', selectedConv.id);
          socket.emit('mark_read', { conversationId: selectedConv.id });
        }
      } catch (err) {
        toast.error('Failed to load message history');
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessageHistory();
  }, [selectedConv, socket]);

  // Reset first load when conversation changes
  useEffect(() => {
    isFirstLoadRef.current = true;
  }, [selectedConv]);

  // Scroll to bottom when messages list updates
  useEffect(() => {
    if (messages.length > 0) {
      chatEndRef.current?.scrollIntoView({
        behavior: isFirstLoadRef.current ? 'auto' : 'smooth',
      });
      isFirstLoadRef.current = false;
    }
  }, [messages]);

  // Parse query parameter to open specific chat on load
  useEffect(() => {
    if (isLoggedIn && !isLoading) {
      const openId = searchParams.get('id');
      const recipientId = searchParams.get('recipientId');

      if (openId) {
        const conv = conversations.find((c: any) => c.id === openId);
        if (conv) {
          setSelectedConv(conv);
        } else if (recipientId) {
          const convByRecipient = conversations.find((c: any) => c.recipient?.id === recipientId);
          if (convByRecipient) {
            setSelectedConv(convByRecipient);
          } else if (!mutatedRef.current) {
            mutatedRef.current = true;
            mutate();
          }
        } else if (!mutatedRef.current) {
          mutatedRef.current = true;
          mutate();
        }
      } else if (recipientId) {
        const conv = conversations.find((c: any) => c.recipient?.id === recipientId);
        if (conv) {
          setSelectedConv(conv);
        } else {
          const initiateChat = async () => {
            try {
              const { data } = await messageApi.startConversation(recipientId);
              mutate();
              setSelectedConv(data);
            } catch (err) {
              toast.error('Failed to initiate conversation');
            }
          };
          initiateChat();
        }
      }
    }
  }, [conversations, isLoading, isLoggedIn, searchParams, mutate]);

  // Send message handler
  const handleSendMessage = (e?: React.FormEvent, textOverride?: string) => {
    e?.preventDefault();
    const finalContent = textOverride || messageText;

    if (!finalContent.trim() || !selectedConv || !socket) return;

    const tempId = `temp-${Date.now()}`;
    const newMsg = {
      id: tempId,
      conversationId: selectedConv.id,
      senderId: user?.id,
      content: finalContent.trim(),
      createdAt: new Date().toISOString(),
      isRead: false,
      sending: true,
      failed: false,
    };

    setMessages((prev) => [...prev, newMsg]);

    socket.emit('send_message', {
      conversationId: selectedConv.id,
      content: finalContent.trim(),
      attachments: []
    });

    if (!textOverride) {
      setMessageText('');
    }

    // Fallback timeout to mark as failed if socket doesn't echo back message within 6s
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId && m.sending ? { ...m, sending: false, failed: true } : m
        )
      );
    }, 6000);
  };

  const handleRetryMessage = (content: string, tempId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== tempId));
    handleSendMessage(undefined, content);
  };

  // Filtered conversation list
  const filteredConversations = conversations.filter((c: any) => {
    const name = c.recipient?.fullName?.toLowerCase() || '';
    const biz = c.recipient?.businessName?.toLowerCase() || '';
    const query = searchTerm.toLowerCase();
    return name.includes(query) || biz.includes(query);
  });

  return (
    <PublicLayout>
      {/* Dynamic Sub-header Navigation */}
      <div className="hidden md:block bg-gradient-to-r from-[#0f172a] to-[#1e293b] border-b border-slate-800 py-5 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] pointer-events-none" />
        <Container size="xl" className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-400">
            <span className="hover:text-emerald-400 cursor-pointer transition-colors" onClick={() => router.push('/home')}>Home</span>
            <span>/</span>
            <span className="text-white bg-slate-800/50 px-3 py-1 rounded-lg border border-slate-700/50">Negotiation Center</span>
          </div>

          <div className="flex items-center gap-2">
            {isConnected ? (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Secure Socket Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Reconnecting Server...
              </span>
            )}
          </div>
        </Container>
      </div>

      <Container size="xl" className="!p-0 !max-w-full md:!max-w-[1400px] md:!px-6 md:py-8 h-[calc(100dvh-96px)] md:h-[800px] flex flex-col">
        <div className="bg-white border-0 md:border border-gray-200/80 shadow-none md:shadow-[0_8px_40px_rgb(0,0,0,0.06)] rounded-none md:rounded-[2rem] flex-1 overflow-hidden flex divide-x divide-gray-100">

          {/* 1. Left List Panel (Conversations) */}
          <div className={clsx(
            "w-full md:w-[340px] shrink-0 flex flex-col bg-slate-50/50 animate-in fade-in slide-in-from-left-4 duration-200",
            selectedConv ? "hidden md:flex" : "flex animate-in fade-in duration-200"
          )}>
            <div className="p-6 border-b border-gray-100 bg-white shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-[11px] font-black text-slate-800 tracking-[0.15em] uppercase flex items-center gap-2">
                    <FaComments className="text-jax-blue h-3.5 w-3.5" />
                    Conversations
                  </h2>
                  <div className="flex items-center gap-2 bg-slate-100 px-2.5 py-1 rounded-full">
                    <span className="text-[10px] font-black text-slate-600">
                      {filteredConversations.length}
                    </span>
                    <span className={clsx(
                      "h-1.5 w-1.5 rounded-full",
                      isConnected ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-amber-500"
                    )} />
                  </div>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-jax-accent/20 to-jax-blue/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search partner or company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200/60 rounded-xl text-xs font-bold outline-none focus:border-jax-accent/50 shadow-sm transition-all placeholder-slate-400 text-slate-800"
                    />
                    <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-jax-accent transition-colors" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide bg-white/80">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="p-6 space-y-3 bg-white">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-3/4 rounded" />
                        <Skeleton className="h-2 w-1/2 rounded" />
                      </div>
                    </div>
                  </div>
                ))
              ) : filteredConversations.length === 0 ? (
                <div className="p-12 text-center text-xs text-gray-400">
                  <div className="h-14 w-14 bg-jax-blue/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaComments className="h-6 w-6 text-jax-blue/40" />
                  </div>
                  <p className="font-bold text-jax-dark uppercase tracking-widest text-[10px] mb-1">No Messages Found</p>
                  <p className="text-[10px] italic text-gray-450">Active chats will appear here.</p>
                </div>
              ) : (
                filteredConversations.map((conv: any) => {
                  const recipient = conv.recipient;
                  const isSelected = selectedConv?.id === conv.id;
                  const isUnread = conv.latestMessage && !conv.latestMessage.isRead && conv.latestMessage.senderId !== user?.id;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConv(conv)}
                      className={clsx(
                        "p-5 cursor-pointer transition-all flex gap-3.5 relative border-b border-slate-50",
                        isSelected
                          ? "bg-jax-blue/[0.03] border-l-4 border-l-jax-blue shadow-sm"
                          : "border-l-4 border-l-transparent bg-white hover:bg-slate-50/80"
                      )}
                    >
                      <div className="relative shrink-0">
                        <Avatar name={recipient?.fullName || 'B2B Trade'} size="md" className="rounded-2xl shadow-sm border border-slate-200/60" />
                        {isConnected && (
                          <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <p className="text-xs font-black text-slate-900 truncate uppercase tracking-tight flex items-center gap-1.5">
                            {recipient?.fullName || 'Trade Partner'}
                            <FaCircleCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                          </p>
                          {conv.latestMessage && (
                            <span className={clsx(
                              "text-[9px] font-bold shrink-0",
                              isUnread ? "text-jax-blue" : "text-slate-400"
                            )}>
                              {new Date(conv.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>

                        {recipient?.businessName && (
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate flex items-center gap-1.5 mb-2">
                            <FaBuilding className="h-3 w-3 text-slate-400 shrink-0" />
                            {recipient.businessName}
                          </p>
                        )}

                        <p className={clsx(
                          "text-xs truncate max-w-full leading-relaxed",
                          isUnread ? "text-slate-900 font-bold" : "text-slate-500 font-medium"
                        )}>
                          {conv.latestMessage?.content || 'Negotiation started...'}
                        </p>
                      </div>

                      {isUnread && (
                        <span className="absolute top-1/2 -translate-y-1/2 right-4 h-2 w-2 rounded-full bg-jax-blue shadow-[0_0_8px_rgba(25,118,210,0.6)] animate-pulse" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 2. Right Panel (Chat Interface) */}
          <div className={clsx(
            "flex-1 flex bg-white min-w-0 relative animate-in fade-in slide-in-from-right-4 duration-200",
            selectedConv ? "flex animate-in fade-in duration-200" : "hidden md:flex"
          )}>
            {selectedConv ? (
              <div className="flex-1 flex divide-x divide-gray-100 min-w-0 w-full">
                <div className="flex-1 flex flex-col min-w-0 w-full">
                  {/* Chat Header */}
                  <div className="p-5 border-b border-gray-100 bg-white flex items-center justify-between shrink-0 shadow-sm z-10">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setSelectedConv(null)} className="md:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-xl">
                        <FaArrowLeft className="h-4 w-4" />
                      </button>
                      <div className="relative">
                        <Avatar name={selectedConv.recipient?.fullName} size="md" className="rounded-2xl shadow-sm border border-gray-150" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#1A1B41] uppercase tracking-wide flex items-center gap-2">
                          {selectedConv.recipient?.fullName || 'Verified Trade Partner'}
                          <FaCircleCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span className={clsx(
                            "h-2 w-2 rounded-full ml-1",
                            isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-ping"
                          )} title={isConnected ? "Connected" : "Reconnecting..."} />
                        </h3>
                        {showProfilePanel && (
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider flex items-center gap-1.5 mt-1">
                            <FaBuilding className="text-gray-400 shrink-0" />
                            {selectedConv.recipient?.businessName || 'Business Manufacturer'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Toggle Profile panel button */}
                    <button
                      type="button"
                      onClick={() => setShowProfilePanel(!showProfilePanel)}
                      className="hidden lg:flex text-xs font-black uppercase tracking-wide px-4 py-2.5 rounded-xl items-center gap-2 transition-all bg-[#1A1B41] text-white hover:bg-[#2A2B51] shadow-sm"
                    >
                      <FaAddressCard className="h-4 w-4" />
                      {showProfilePanel ? 'HIDE PROFILE' : 'SHOW PROFILE'}
                    </button>
                  </div>

                  {/* Product Context Card — Always visible when chat has a listing */}
                  {listingData && (
                    <div className="p-4 bg-white shrink-0 flex justify-center border-b border-gray-100">
                      <div className="flex items-center gap-4 bg-slate-50/80 rounded-2xl p-4 border border-slate-100 shadow-sm w-full">
                        {(listingData.imageUrl || listingData.media?.[0]?.url) && (
                          <img src={listingData.imageUrl || listingData.media?.[0]?.url} alt="" className="h-12 w-12 md:h-14 md:w-14 rounded-xl object-cover border border-slate-200 shrink-0 shadow-sm" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm md:text-base font-bold text-[#1A1B41] uppercase tracking-wide truncate">{listingData.title}</p>
                          <div className="flex items-center gap-3 mt-1">
                            {(listingData.pricePerUnit || listingData.productDetail?.pricePerUnit) && (
                              <span className="text-sm font-bold text-[#3B9285]">₹{(listingData.pricePerUnit || listingData.productDetail?.pricePerUnit)?.toLocaleString('en-IN')}<span className="text-xs text-slate-400 font-medium">/{listingData.unitOfMeasure || listingData.productDetail?.unitOfMeasure || 'Unit'}</span></span>
                            )}
                            <span className="text-xs text-slate-500 font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200">MOQ: {listingData.minOrderQty || listingData.productDetail?.minOrderQty || 1}</span>
                          </div>
                        </div>
                        {listingData.id && (
                          <Link href={`/listings/${listingData.id}`}>
                            <button className="text-xs font-bold text-[#1A1B41] uppercase tracking-wide px-4 py-2 bg-white rounded-full border border-[#1A1B41]/20 hover:border-[#1A1B41]/50 hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap">VIEW PRODUCT</button>
                          </Link>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Deal Status Bar */}
                  {activeOrder && (
                    <div className="border-b border-emerald-100 p-3 bg-emerald-50/50 shrink-0">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <FaHandshake className="h-4 w-4 text-emerald-600" />
                          <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">Deal: ₹{activeOrder.totalAmount?.toLocaleString('en-IN')}</span>
                          <Badge status={activeOrder.status} className="text-[8px]" />
                        </div>
                        <div className="flex items-center gap-2">
                          {activeOrder.status === 'CREATED' && activeOrder.proposerId !== user?.id && (
                            <>
                              <Button
                                onClick={handleSignContract}
                                loading={signingDeal}
                                variant="success"
                                className="h-8 px-4 text-[9px] font-black uppercase tracking-wider rounded-lg border-none shadow-sm"
                              >
                                Accept & Sign
                              </Button>
                              <Button
                                onClick={handleRejectContract}
                                loading={rejectingDeal}
                                variant="danger"
                                className="h-8 px-4 text-[9px] font-black uppercase tracking-wider rounded-lg border-none shadow-sm"
                              >
                                Decline
                              </Button>
                            </>
                          )}
                          {activeOrder.status === 'CREATED' && activeOrder.proposerId === user?.id && (
                            <span className="text-[9px] font-bold text-amber-600 px-2 py-1 bg-amber-50 rounded-lg border border-amber-100">Awaiting signature</span>
                          )}
                          {activeOrder.status !== 'CREATED' && (
                            <Link href={`/orders/${activeOrder.id}`}>
                              <button className="h-8 px-4 bg-jax-dark text-white text-[9px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5">Manage <FaArrowRight className="h-2.5 w-2.5" /></button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* RFQ Context — only if no deal and has RFQ */}
                  {!activeOrder && selectedConv.rfqId && (
                    <div className="border-b border-gray-100 p-3 bg-jax-blue/[0.02] shrink-0">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <FaFileContract className="h-4 w-4 text-jax-blue" />
                          <span className="text-[10px] font-black text-jax-dark uppercase tracking-wider">RFQ Sourcing Request</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/rfq/${selectedConv.rfqId}`}>
                            <button className="h-8 px-3 border border-jax-blue text-jax-blue text-[9px] font-black uppercase tracking-wider rounded-lg hover:bg-jax-blue/5 flex items-center gap-1">View <FaArrowRight className="h-2.5 w-2.5" /></button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Chat Message Logs */}
                  <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-6 bg-gray-50/30 min-h-0">
                    {loadingMessages ? (
                      <div className="space-y-6">
                        <div className="flex gap-3 max-w-[60%]">
                          <Skeleton className="h-10 w-10 rounded-xl" />
                          <Skeleton className="h-12 flex-1 rounded-2xl rounded-tl-none" />
                        </div>
                        <div className="flex gap-3 max-w-[60%] ml-auto justify-end">
                          <Skeleton className="h-12 flex-1 rounded-2xl rounded-tr-none" />
                          <Skeleton className="h-10 w-10 rounded-xl" />
                        </div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-20 text-xs text-gray-400">
                        <div className="h-16 w-16 bg-white border border-gray-100 shadow-md rounded-full flex items-center justify-center mx-auto mb-4">
                          <FaComments className="h-8 w-8 text-jax-blue" />
                        </div>
                        <h4 className="font-black text-jax-dark uppercase tracking-widest text-[11px] mb-1">No Messages Yet</h4>
                        <p className="text-[10px] text-gray-400 italic">Initiate conversation below using quick templates or custom text.</p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMe = msg.senderId === user?.id;
                        const isDealMsg = msg.content?.includes('[DEAL PROPOSAL]');

                        if (isDealMsg) {
                          return (
                            <div key={msg.id} className="mx-auto max-w-[85%]">
                              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="h-8 w-8 bg-emerald-100 rounded-xl flex items-center justify-center"><FaHandshake className="h-4 w-4 text-emerald-600" /></div>
                                  <div>
                                    <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Deal Proposal</p>
                                    <p className="text-[10px] text-gray-500">by {isMe ? 'You' : selectedConv.recipient?.fullName}</p>
                                  </div>
                                </div>
                                {activeOrder && (
                                  <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-emerald-100 mb-3">
                                    <div>
                                      <p className="text-[9px] text-gray-400 font-bold uppercase">Contract Value</p>
                                      <p className="text-lg font-black text-jax-dark">₹{activeOrder.totalAmount?.toLocaleString('en-IN')}</p>
                                    </div>
                                    <Badge status={activeOrder.status} className="text-[8px]" />
                                  </div>
                                )}
                                {activeOrder?.status === 'CREATED' && activeOrder.proposerId !== user?.id && (
                                  <div className="flex gap-2">
                                    <Button onClick={handleSignContract} loading={signingDeal} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider py-2.5 rounded-xl border-none shadow-md shadow-emerald-600/20">
                                      ✅ Accept & Sign
                                    </Button>
                                    <Button onClick={handleRejectContract} loading={rejectingDeal} className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-[10px] font-black uppercase tracking-wider py-2.5 rounded-xl transition-colors">
                                      ❌ Decline
                                    </Button>
                                  </div>
                                )}
                                {activeOrder?.status === 'CREATED' && activeOrder.proposerId === user?.id && (
                                  <p className="text-[9px] text-amber-600 font-bold uppercase text-center bg-amber-50 py-2 rounded-lg border border-amber-100">⏳ Waiting for other party to accept</p>
                                )}
                                {activeOrder && activeOrder.status !== 'CREATED' && (
                                  <Link href={`/orders/${activeOrder.id}`}><Button className="w-full bg-jax-dark text-white text-[10px] font-black uppercase tracking-wider py-2.5 rounded-xl border-none">View Order →</Button></Link>
                                )}
                              </div>
                              <p className="text-center text-[9px] text-gray-400 mt-1.5">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={msg.id}
                            className={clsx(
                              "flex gap-3 max-w-[75%] animate-in fade-in zoom-in-[0.98] duration-300 ease-out fill-mode-both",
                              isMe ? "ml-auto flex-row-reverse slide-in-from-right-4" : "mr-auto slide-in-from-left-4"
                            )}
                          >
                            <div className="shrink-0 self-end">
                              <Avatar name={isMe ? user?.fullName : selectedConv.recipient?.fullName} size="sm" className="rounded-xl border border-gray-100 shadow-sm" />
                            </div>
                            <div className="flex flex-col group">
                              <div
                                className={clsx(
                                  "px-5 py-3.5 rounded-[22px] text-[13px] leading-relaxed font-semibold transition-all duration-300 hover:-translate-y-0.5 backdrop-blur-sm",
                                  isMe
                                    ? "bg-gradient-to-br from-[#1E2E5C] via-[#232F72] to-[#2F578A] text-white rounded-br-[6px] shadow-[0_8px_20px_-6px_rgba(35,47,114,0.4)] border border-white/10"
                                    : "bg-white/95 text-slate-700 rounded-bl-[6px] shadow-[0_4px_20px_-6px_rgba(0,0,0,0.08)] border border-slate-200/60"
                                )}
                              >
                                {msg.content}
                              </div>
                              <div className={clsx("flex items-center gap-1.5 text-[9px] text-gray-400 font-semibold mt-1.5", isMe ? "justify-end" : "justify-start")}>
                                <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                {isMe && (
                                  <span className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                    {msg.sending ? (
                                      <span className="h-2.5 w-2.5 rounded-full border-2 border-gray-300 border-t-transparent animate-spin mr-1 shrink-0" />
                                    ) : msg.failed ? (
                                      <span className="flex items-center gap-1 text-red-500 font-bold uppercase tracking-wider text-[8px] animate-pulse">
                                        ⚠️ Failed • <button onClick={() => handleRetryMessage(msg.content, msg.id)} className="underline hover:text-red-650 cursor-pointer font-black transition-colors">Retry</button>
                                      </span>
                                    ) : (
                                      <>
                                        {msg.isRead ? (
                                          <FaCheckDouble className="text-jax-teal h-2.5 w-2.5" />
                                        ) : (
                                          <FaCheckDouble className="text-gray-300 h-2.5 w-2.5" />
                                        )}
                                        <span className={clsx("font-bold text-[8px] uppercase tracking-wider", msg.isRead ? "text-jax-teal" : "text-gray-350")}>
                                          {msg.isRead ? 'Read' : 'Sent'}
                                        </span>
                                      </>
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Quick Negotiation Templates */}
                  {showTemplates ? (
                    <div className="px-4 py-2 bg-white border-t border-gray-100 shrink-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-jax-blue" />
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">B2B Quick Replies</p>
                        </div>
                        <button type="button" onClick={() => setShowTemplates(false)} className="text-[9px] font-black text-gray-400 hover:text-jax-blue transition-colors">
                          Dismiss
                        </button>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-hide">
                        {B2B_TEMPLATES.map((tmpl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendMessage(undefined, tmpl)}
                            className="bg-gray-50 hover:bg-jax-blue/[0.03] hover:text-jax-blue border border-gray-100 rounded-xl px-4 py-2 text-[10px] text-jax-dark font-black tracking-wide whitespace-nowrap transition-all shrink-0 hover:border-jax-blue/20"
                          >
                            {tmpl.substring(0, 36)}...
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-1.5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between shrink-0">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Quick Replies Hidden</p>
                      <button type="button" onClick={() => setShowTemplates(true)} className="text-[9px] font-black text-jax-blue hover:underline">
                        Show Replies
                      </button>
                    </div>
                  )}
                  {/* Inline Deal Proposal — Smart, Auto-populated */}
                  {showProposeForm && !activeOrder && (
                    <div className="border-t border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 shrink-0 animate-in slide-in-from-bottom duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <FaHandshake className="h-3.5 w-3.5 text-emerald-600" />
                          </div>
                          <div>
                            <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">Propose a Deal</h4>
                            <p className="text-[8px] text-emerald-600">Secured by JaxMart Escrow</p>
                          </div>
                        </div>
                        <button onClick={() => setShowProposeForm(false)} className="h-6 w-6 bg-white rounded-md flex items-center justify-center text-gray-400 hover:text-red-500 border border-gray-200 transition-colors">
                          <FaXmark className="h-2.5 w-2.5" />
                        </button>
                      </div>

                      {/* Product info auto-filled */}
                      {listingData && (
                        <div className="bg-white rounded-lg p-2.5 border border-emerald-100 mb-3 flex items-center gap-2.5">
                          {(listingData.imageUrl || listingData.media?.[0]?.url) && (
                            <img src={listingData.imageUrl || listingData.media?.[0]?.url} alt="" className="h-9 w-9 rounded-md object-cover" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-black text-jax-dark uppercase truncate">{listingData.title}</p>
                            <p className="text-[9px] text-emerald-600 font-bold">₹{(listingData.pricePerUnit || listingData.productDetail?.pricePerUnit)?.toLocaleString('en-IN')}/{listingData.unitOfMeasure || listingData.productDetail?.unitOfMeasure || 'Unit'}</p>
                          </div>
                        </div>
                      )}

                      <form onSubmit={handleProposeDeal}>
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <label className="text-[8px] font-black text-emerald-700 uppercase tracking-wider mb-1 block">Quantity *</label>
                            <input type="number" required min="1" placeholder={`Min ${listingData?.minOrderQty || listingData?.productDetail?.minOrderQty || 1}`}
                              value={dealQty} onChange={e => setDealQty(e.target.value)}
                              className="w-full h-9 px-3 bg-white border border-emerald-200 rounded-lg text-xs font-semibold outline-none focus:border-emerald-400" />
                          </div>
                          <div className="flex-1">
                            <label className="text-[8px] font-black text-emerald-700 uppercase tracking-wider mb-1 block">Price/Unit (₹) <span className="text-gray-400 font-medium">{listingData ? 'auto' : 'required'}</span></label>
                            <input type="number" min="1" placeholder={(listingData?.pricePerUnit || listingData?.productDetail?.pricePerUnit || '').toString()}
                              value={dealCustomPrice} onChange={e => setDealCustomPrice(e.target.value)}
                              className="w-full h-9 px-3 bg-white border border-emerald-200 rounded-lg text-xs font-semibold outline-none focus:border-emerald-400" />
                          </div>
                          {/* Live total */}
                          <div className="shrink-0 text-center pb-0.5">
                            <p className="text-[7px] font-black text-gray-400 uppercase mb-1">Total</p>
                            <p className="text-sm font-black text-emerald-700">
                              ₹{((parseInt(dealQty) || 0) * (Number(dealCustomPrice) || listingData?.pricePerUnit || listingData?.productDetail?.pricePerUnit || 0)).toLocaleString('en-IN')}
                            </p>
                          </div>
                          <Button type="submit" loading={submittingDeal}
                            className="h-9 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-wider rounded-lg border-none shadow-md shadow-emerald-600/20 shrink-0">
                            Send Deal
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Messaging Footer Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white flex gap-2 shrink-0 items-center">
                    {/* Make a Deal Button */}
                    {!activeOrder && (
                      <button
                        type="button"
                        onClick={() => setShowProposeForm(!showProposeForm)}
                        className={clsx(
                          "h-12 px-4 rounded-2xl flex items-center gap-2 transition-all shrink-0 font-bold text-xs uppercase tracking-wide border-2",
                          showProposeForm
                            ? "bg-[#3B9285] text-white border-[#3B9285] shadow-lg shadow-[#3B9285]/20"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300"
                        )}
                      >
                        <FaHandshake className="h-4 w-4" />
                        <span className="hidden sm:inline">Make a Deal</span>
                      </button>
                    )}
                    {activeOrder && (
                      <Link href={`/orders/${activeOrder.id}`} className="shrink-0">
                        <button type="button" className="h-12 px-4 rounded-2xl flex items-center gap-2 bg-[#1A1B41] text-white font-bold text-xs uppercase tracking-wide hover:bg-[#2A2B51] transition-all">
                          <FaFileContract className="h-4 w-4" />
                          <span className="hidden sm:inline">
                            {activeOrder.status === 'CREATED' ? 'View Proposal' : 'View Order'}
                          </span>
                        </button>
                      </Link>
                    )}
                    <div className="flex-1 relative flex items-center min-w-0">
                      <textarea
                        placeholder="Type your message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        rows={1}
                        className="w-full py-3.5 pl-4 pr-12 bg-gray-50/50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-[#1A1B41]/30 focus:ring-2 focus:ring-[#1A1B41]/10 focus:bg-white transition-all shadow-inner resize-none min-h-[48px] max-h-24 scrollbar-hide flex items-center"
                      />
                      <button type="button" className="absolute right-3.5 text-slate-400 hover:text-[#1A1B41] transition-colors">
                        <FaPaperclip className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={!messageText.trim()}
                      className={clsx(
                        "h-12 w-12 rounded-2xl flex items-center justify-center transition-all shrink-0 shadow-sm",
                        messageText.trim()
                          ? "bg-[#1A1B41] text-white hover:bg-[#2A2B51] shadow-[#1A1B41]/20"
                          : "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
                      )}
                    >
                      <FaPaperPlane className="h-4 w-4" />
                    </button>
                  </form>
                </div>

                {/* Profile Panel Drawer (Right Sidebar) */}
                <div className={clsx(
                  "bg-white shrink-0 z-20 transition-all duration-300 hidden lg:flex overflow-hidden",
                  showProfilePanel ? "w-[288px] min-w-[288px] max-w-[288px] border-l border-gray-100 opacity-100 translate-x-0" : "w-0 min-w-0 border-l-0 opacity-0 translate-x-8"
                )}>
                  <div className="w-[288px] flex flex-col p-6 overflow-y-auto scrollbar-hide h-full">
                  <div className="text-center pb-6 border-b border-gray-50">
                    <Avatar name={selectedConv.recipient?.fullName} size="lg" className="rounded-[2rem] border-4 border-jax-blue/5 shadow-md mx-auto mb-4" />
                    <h3 className="text-xs font-black text-jax-dark uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                      {selectedConv.recipient?.fullName}
                      <FaCircleCheck className="h-3.5 w-3.5 text-jax-teal" />
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                      <FaBuilding className="h-3 w-3" /> {selectedConv.recipient?.businessName || 'Independent Partner'}
                    </p>

                    <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                      <FaShieldHalved className="h-3 w-3" /> KYC Verified
                    </div>
                  </div>

                  {/* B2B Deal Status */}
                  <div className="py-6 border-b border-gray-50">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Deal Status</p>
                    {activeOrder ? (
                      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase">Active Deal</span>
                          <Badge status={activeOrder.status} className="text-[8px]" />
                        </div>
                        <p className="text-lg font-black text-jax-dark">₹{activeOrder.totalAmount?.toLocaleString('en-IN')}</p>
                        <Link href={`/orders/${activeOrder.id}`}>
                          <Button className="w-full bg-jax-dark text-white text-[9px] font-black uppercase tracking-wider py-2 rounded-xl border-none mt-1">
                            Manage Order →
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-100 p-3 rounded-2xl text-center">
                        <p className="text-[10px] text-gray-400 font-medium">No active deal. Use the <span className="font-black text-emerald-600">Make a Deal</span> button below.</p>
                      </div>
                    )}
                  </div>

                  {/* Trust Score Area */}
                  <div className="py-6 border-b border-gray-50">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Integrity Audit</p>
                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-center gap-3">
                      <div className="shrink-0">
                        <TrustScore score={95} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-jax-dark uppercase tracking-tight">Trust Index: 95/100</p>
                        <p className="text-[9px] text-gray-400 mt-0.5">Top-tier verified partner with zero active disputes.</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="py-6 space-y-4">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Business Statistics</p>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-450 uppercase">Response Rate</span>
                      <span className="text-[10px] font-black text-emerald-600 font-mono">100%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-455 uppercase">Avg. Response Time</span>
                      <span className="text-[10px] font-black text-jax-dark font-mono">&lt; 15 mins</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-455 uppercase">Fulfilled Orders</span>
                      <span className="text-[10px] font-black text-jax-dark font-mono">48 Transactions</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-455 uppercase">KYC Reference ID</span>
                      <span className="text-[10px] font-black text-gray-400 font-mono">#KYC-9428-A</span>
                    </div>
                  </div>

                  {/* Safety Warning */}
                  <div className="mt-auto p-4 bg-jax-dark rounded-2xl text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <FaShieldHalved className="text-jax-teal h-3.5 w-3.5" />
                      <p className="text-[9px] font-black uppercase tracking-widest">Secured Escrow</p>
                    </div>
                    <p className="text-[9px] text-white/60 leading-relaxed font-semibold">Keep conversations on JaxMart to benefit from platform escrow guarantees and arbitration.</p>
                  </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-jax-blue/5 rounded-full blur-3xl" />
                <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
                
                <div className="h-28 w-28 rounded-full bg-white flex items-center justify-center shadow-[0_8px_40px_rgb(0,0,0,0.06)] mb-8 border border-white relative group z-10">
                  <div className="absolute inset-0 rounded-full border border-jax-blue/20 animate-[spin_4s_linear_infinite]" />
                  <div className="absolute -inset-2 bg-gradient-to-r from-jax-blue/20 to-emerald-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <FaComments className="h-10 w-10 text-transparent bg-clip-text bg-gradient-to-br from-[#1E2E5C] to-jax-blue relative z-10" />
                </div>
                
                <h3 className="text-xl font-heading font-black text-slate-900 uppercase tracking-tight mb-3 z-10">Trade Negotiation Center</h3>
                <p className="text-xs text-slate-500 max-w-md text-center leading-relaxed font-medium z-10 bg-white/50 p-4 rounded-2xl border border-slate-200/50 shadow-sm backdrop-blur-sm">
                  Select a trade partner from the list to start negotiating prices, securely share documents, and finalize business contracts under <strong>JaxMart Escrow Protection</strong>.
                </p>
              </div>
            )}
          </div>

        </div>
      </Container>
    </PublicLayout>
  );
}
