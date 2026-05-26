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
  const { socket } = useSocket();

  // Conversations query
  const { data: conversations = [], error, isLoading, mutate } = useConversations();

  // Active chat state
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfilePanel, setShowProfilePanel] = useState(true);

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

  // Scroll to bottom when messages list updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Parse query parameter to open specific chat on load
  useEffect(() => {
    if (!isLoading) {
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
          } else {
            mutate();
          }
        } else {
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
  }, [conversations, isLoading, searchParams, mutate]);

  // Send message handler
  const handleSendMessage = (e?: React.FormEvent, textOverride?: string) => {
    e?.preventDefault();
    const finalContent = textOverride || messageText;

    if (!finalContent.trim() || !selectedConv || !socket) return;

    socket.emit('send_message', {
      conversationId: selectedConv.id,
      content: finalContent.trim(),
      attachments: []
    });

    if (!textOverride) {
      setMessageText('');
    }
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
      <div className="bg-white border-b border-gray-100 py-4 shadow-sm">
        <Container size="xl" className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <span className="hover:text-jax-blue cursor-pointer transition-colors" onClick={() => router.push('/home')}>Home</span>
            <span>/</span>
            <span className="text-jax-dark font-black uppercase tracking-wider">Negotiation Center</span>
          </div>

          <div className="flex items-center gap-2">
            {socket?.connected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Connection Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-100">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Reconnecting Server...
              </span>
            )}
          </div>
        </Container>
      </div>

      <Container size="xl" className="p-0 md:py-8 h-[calc(100vh-120px)] md:h-[750px] flex flex-col">
        <div className="bg-white border-0 md:border border-gray-100 shadow-none md:shadow-2xl shadow-gray-150/40 rounded-none md:rounded-[32px] flex-1 overflow-hidden flex divide-x divide-gray-100">
          
          {/* 1. Left List Panel (Conversations) */}
          <div className={clsx(
            "w-full md:w-80 shrink-0 flex flex-col bg-gray-50/50",
            selectedConv ? "hidden md:flex" : "flex"
          )}>
            <div className="p-6 border-b border-gray-100 bg-white shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-black text-jax-dark uppercase tracking-[0.15em]">Conversations</h2>
                <span className="text-[10px] font-black font-mono text-jax-blue bg-jax-blue/5 px-2 py-0.5 rounded-md">
                  {filteredConversations.length} Active
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search partner or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-100 rounded-xl text-xs font-medium outline-none focus:border-jax-blue focus:bg-white transition-all shadow-inner"
                />
                <FaMagnifyingGlass className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-gray-400" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-50 bg-white/50">
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
                        "p-5 cursor-pointer hover:bg-jax-blue/[0.02] transition-all flex gap-3.5 relative border-l-4",
                        isSelected 
                          ? "bg-jax-blue/[0.03] border-jax-blue pl-4 shadow-sm" 
                          : "border-transparent bg-white"
                      )}
                    >
                      <div className="relative shrink-0">
                        <Avatar name={recipient?.fullName || 'B2B Trade'} size="md" className="rounded-2xl shadow-sm border border-gray-100" />
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <p className="text-[11px] font-black text-jax-dark truncate uppercase tracking-tight flex items-center gap-1">
                            {recipient?.fullName || 'Trade Partner'}
                            <FaCircleCheck className="h-3 w-3 text-jax-teal shrink-0" />
                          </p>
                          {conv.latestMessage && (
                            <span className="text-[9px] text-gray-400 font-bold shrink-0">
                              {new Date(conv.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>

                        {recipient?.businessName && (
                          <p className="text-[9px] text-gray-500 font-bold truncate flex items-center gap-1.5 mb-2">
                            <FaBuilding className="h-3 w-3 text-gray-400 shrink-0" /> 
                            {recipient.businessName}
                          </p>
                        )}

                        <p className={clsx(
                          "text-xs truncate max-w-full italic",
                          isUnread ? "text-jax-blue font-bold not-italic" : "text-gray-400 font-medium"
                        )}>
                          {conv.latestMessage?.content || 'Negotiation started...'}
                        </p>
                      </div>

                      {isUnread && (
                        <span className="absolute top-5 right-5 h-2.5 w-2.5 rounded-full bg-jax-blue shadow-sm animate-pulse" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
 
          {/* 2. Right Panel (Chat Interface) */}
          <div className={clsx(
            "flex-1 flex bg-white min-w-0 relative",
            selectedConv ? "flex" : "hidden md:flex"
          )}>
            {selectedConv ? (
              <div className="flex-1 flex divide-x divide-gray-100">
                <div className="flex-1 flex flex-col min-w-0">
                  {/* Chat Header */}
                  <div className="p-5 border-b border-gray-100 bg-white flex items-center justify-between shrink-0 shadow-sm z-10">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setSelectedConv(null)} className="md:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-xl">
                        <FaArrowLeft className="h-4 w-4" />
                      </button>
                      <div className="relative">
                        <Avatar name={selectedConv.recipient?.fullName} size="md" className="rounded-2xl shadow-sm border border-gray-150" />
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-jax-dark uppercase tracking-wider flex items-center gap-1">
                          {selectedConv.recipient?.fullName || 'Verified Trade Partner'}
                          <FaCircleCheck className="h-3.5 w-3.5 text-jax-teal shrink-0" />
                        </h3>
                        <p className="text-[9px] text-gray-450 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1">
                          <FaBuilding className="text-gray-400 shrink-0" /> 
                          {selectedConv.recipient?.businessName || 'Business Manufacturer'}
                        </p>
                      </div>
                    </div>

                    {/* Toggle Profile panel button */}
                    <button 
                      onClick={() => setShowProfilePanel(!showProfilePanel)}
                      className={clsx(
                        "hidden lg:flex text-[10px] font-black uppercase tracking-widest px-4 py-2 border rounded-xl items-center gap-2 transition-all",
                        showProfilePanel 
                          ? "bg-jax-dark text-white border-jax-dark shadow-md" 
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <FaAddressCard className="h-3.5 w-3.5" />
                      {showProfilePanel ? 'Hide Profile' : 'Show Profile'}
                    </button>
                  </div>

                  {/* Product Context Card — Always visible when chat has a listing */}
                  {listingData && (
                    <div className="border-b border-gray-100 p-3 bg-white shrink-0">
                      <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                        {(listingData.imageUrl || listingData.media?.[0]?.url) && (
                          <img src={listingData.imageUrl || listingData.media?.[0]?.url} alt="" className="h-12 w-12 rounded-lg object-cover border border-gray-200 shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-black text-jax-dark uppercase tracking-tight truncate">{listingData.title}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            {(listingData.pricePerUnit || listingData.productDetail?.pricePerUnit) && (
                              <span className="text-xs font-black text-emerald-600">₹{(listingData.pricePerUnit || listingData.productDetail?.pricePerUnit)?.toLocaleString('en-IN')}<span className="text-[9px] text-gray-400 font-medium">/{listingData.unitOfMeasure || listingData.productDetail?.unitOfMeasure || 'Unit'}</span></span>
                            )}
                            <span className="text-[9px] text-gray-400 font-bold">MOQ: {listingData.minOrderQty || listingData.productDetail?.minOrderQty || 1}</span>
                          </div>
                        </div>
                        {listingData.id && (
                          <Link href={`/listings/${listingData.id}`}>
                            <button className="text-[8px] font-black text-jax-blue uppercase tracking-wider px-3 py-1.5 bg-jax-blue/5 rounded-lg border border-jax-blue/10 hover:bg-jax-blue/10 transition-colors whitespace-nowrap">View Product</button>
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
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30 min-h-0">
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
                          <div key={msg.id} className={clsx("flex gap-3 max-w-[75%]", isMe ? "ml-auto flex-row-reverse" : "mr-auto")}>
                            <div className="shrink-0 self-end">
                              <Avatar name={isMe ? user?.fullName : selectedConv.recipient?.fullName} size="sm" className="rounded-xl border border-gray-100" />
                            </div>
                            <div className="flex flex-col">
                              <div
                                className={clsx(
                                  "p-4 rounded-3xl text-xs leading-relaxed shadow-sm font-medium",
                                  isMe
                                    ? "bg-gradient-to-r from-jax-blue to-jax-teal text-white rounded-br-none shadow-jax-blue/10"
                                    : "bg-white border border-gray-100 text-jax-dark rounded-bl-none"
                                )}
                              >
                                {msg.content}
                              </div>
                              <div className={clsx("flex items-center gap-1.5 text-[9px] text-gray-400 font-semibold mt-1.5", isMe ? "justify-end" : "justify-start")}>
                                <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                {isMe && (
                                  <span className="flex items-center gap-0.5">
                                    {msg.isRead ? (
                                      <FaCheckDouble className="text-jax-teal h-2.5 w-2.5" />
                                    ) : (
                                      <FaCheckDouble className="text-gray-300 h-2.5 w-2.5" />
                                    )}
                                    <span className={clsx("font-bold text-[8px] uppercase tracking-wider", msg.isRead ? "text-jax-teal" : "text-gray-350")}>
                                      {msg.isRead ? 'Read' : 'Sent'}
                                    </span>
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
                  <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-jax-blue" />
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">B2B Quick Replies</p>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-hide">
                      {B2B_TEMPLATES.map((tmpl, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(undefined, tmpl)}
                          className="bg-gray-50 hover:bg-jax-blue/[0.03] hover:text-jax-blue border border-gray-100 rounded-xl px-4 py-2 text-[10px] text-jax-dark font-black tracking-wide whitespace-nowrap transition-all shrink-0 hover:border-jax-blue/20"
                        >
                          {tmpl.substring(0, 36)}...
                        </button>
                      ))}
                    </div>
                  </div>
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
                          "h-12 px-4 rounded-2xl flex items-center gap-2 transition-all shrink-0 font-black text-[9px] uppercase tracking-wider border-2",
                          showProposeForm
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300"
                        )}
                      >
                        <FaHandshake className="h-4 w-4" />
                        <span className="hidden sm:inline">Make a Deal</span>
                      </button>
                    )}
                    {activeOrder && (
                      <Link href={`/orders/${activeOrder.id}`} className="shrink-0">
                        <button type="button" className="h-12 px-4 rounded-2xl flex items-center gap-2 bg-jax-dark text-white font-black text-[9px] uppercase tracking-wider hover:bg-jax-blue transition-all">
                          <FaFileContract className="h-4 w-4" />
                          <span className="hidden sm:inline">
                            {activeOrder.status === 'CREATED' ? 'View Proposal' : 'View Order'}
                          </span>
                        </button>
                      </Link>
                    )}
                    <div className="flex-1 relative flex items-center">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="w-full h-12 border border-gray-100 rounded-2xl pl-4 pr-12 text-xs font-semibold outline-none focus:border-jax-blue focus:bg-gray-50/20 transition-all bg-gray-50/50 shadow-inner"
                      />
                      <button type="button" className="absolute right-3.5 text-gray-400 hover:text-jax-blue transition-colors">
                        <FaPaperclip className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={!messageText.trim()}
                      className={clsx(
                        "h-12 w-12 rounded-2xl flex items-center justify-center transition-all shrink-0 shadow-lg",
                        messageText.trim()
                          ? "bg-jax-dark text-white hover:bg-jax-blue shadow-jax-blue/20"
                          : "bg-gray-100 text-gray-300 cursor-not-allowed shadow-none"
                      )}
                    >
                      <FaPaperPlane className="h-4 w-4" />
                    </button>
                  </form>
                </div>

                {/* Profile Panel Drawer (Right Sidebar) */}
                {showProfilePanel && (
                  <div className="hidden lg:flex w-72 bg-white flex-col p-6 overflow-y-auto shrink-0 animate-in slide-in-from-right duration-350 z-20">
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
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 bg-gray-50/10">
                <div className="h-20 w-20 rounded-[2.5rem] bg-white flex items-center justify-center shadow-xl mb-6 border border-gray-100 relative group">
                  <div className="absolute inset-0 bg-jax-blue/20 blur-xl opacity-30 group-hover:opacity-60 transition-opacity" />
                  <FaComments className="h-8 w-8 text-jax-blue relative z-10" />
                </div>
                <h3 className="font-black text-jax-dark uppercase tracking-wider text-xs">JaxMart Message Center</h3>
                <p className="text-xs text-gray-400 max-w-sm text-center mt-2 leading-relaxed italic">
                  Select a supplier or buyer conversation from the left to start negotiating prices, sharing files, and finalising transaction contracts under secure escrow.
                </p>
              </div>
            )}
          </div>

        </div>
      </Container>
    </PublicLayout>
  );
}
