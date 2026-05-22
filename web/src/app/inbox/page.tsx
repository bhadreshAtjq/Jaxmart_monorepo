'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';
import {
  FaPaperPlane, FaBuilding, FaUser, FaComments, FaArrowLeft,
  FaFileContract, FaBoxesStacked, FaShieldHalved, FaPaperclip,
  FaArrowRight
} from 'react-icons/fa6';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button, Container, Card, Badge, Avatar, Skeleton, TrustScore } from '@/components/ui';
import { useAuthStore } from '@/lib/store';
import { messageApi } from '@/lib/api';
import { useConversations } from '@/lib/hooks';
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
        <Container size="xl" className="py-20 text-center"><Skeleton className="h-64 rounded-xl" /></Container>
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

  // Conversations query
  const { data: conversations = [], error, isLoading, mutate } = useConversations();

  // Active chat state
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Socket state
  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Check login
  useEffect(() => {
    if (!isLoggedIn) {
      toast.error('Please log in to access the Message Center');
      router.push('/auth/login');
    }
  }, [isLoggedIn, router]);

  // Establish Socket.io connection
  useEffect(() => {
    if (!isLoggedIn || !token) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
    
    // Connect to backend with JWT token
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket client connected');
    });

    // Listen for new messages
    socket.on('new_message', (message: any) => {
      // If message belongs to active conversation, append it in real-time
      if (selectedConv && message.conversationId === selectedConv.id) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
        
        // Mark read
        socket.emit('mark_read', { conversationId: selectedConv.id });
      }

      // Refresh list of conversations to display latest preview
      mutate();
    });

    // Handle incoming notifications (e.g. unread dots)
    socket.on('notification', (data: any) => {
      if (data.type === 'new_message') {
        mutate();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [isLoggedIn, token, selectedConv, mutate]);

  // Load message history on conversation select
  useEffect(() => {
    if (!selectedConv) return;

    const fetchMessageHistory = async () => {
      setLoadingMessages(true);
      try {
        const { data } = await messageApi.getMessages(selectedConv.id);
        setMessages(data);

        // Tell socket we joined this room
        if (socketRef.current) {
          socketRef.current.emit('join_conversation', selectedConv.id);
          socketRef.current.emit('mark_read', { conversationId: selectedConv.id });
        }
      } catch (err) {
        toast.error('Failed to load message history');
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessageHistory();
  }, [selectedConv]);

  // Scroll to bottom when messages list updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Parse query parameter to open specific chat on load
  useEffect(() => {
    if (conversations.length > 0) {
      const openId = searchParams.get('id');
      const recipientId = searchParams.get('recipientId');

      if (openId) {
        const conv = conversations.find((c: any) => c.id === openId);
        if (conv) setSelectedConv(conv);
      } else if (recipientId) {
        // Find existing conversation with recipient
        const conv = conversations.find((c: any) => c.recipient?.id === recipientId);
        if (conv) {
          setSelectedConv(conv);
        } else {
          // Create a new one
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
  }, [conversations, searchParams]);

  // Send message handler
  const handleSendMessage = (e?: React.FormEvent, textOverride?: string) => {
    e?.preventDefault();
    const finalContent = textOverride || messageText;

    if (!finalContent.trim() || !selectedConv || !socketRef.current) return;

    // Send via socket
    socketRef.current.emit('send_message', {
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
      <div className="bg-gray-50 border-b border-gray-200">
        <Container size="xl" className="py-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1.5 font-semibold">
              <span className="hover:underline cursor-pointer" onClick={() => router.push('/home')}>Home</span>
              <span>›</span>
              <span className="text-gray-800">Inbox</span>
            </div>
            {socketRef.current?.connected ? (
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Server Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-600 font-bold">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Reconnecting...
              </span>
            )}
          </div>
        </Container>
      </div>

      <Container size="xl" className="py-6 max-h-[calc(100vh-140px)] flex flex-col h-[700px] min-h-[500px]">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex-1 overflow-hidden flex divide-x divide-gray-200">
          
          {/* 1. Left List Panel (Conversations) */}
          <div className="w-full md:w-80 shrink-0 flex flex-col bg-gray-50/50">
            <div className="p-4 border-b border-gray-200 bg-white shrink-0">
              <h2 className="font-bold text-sm text-gray-900 uppercase tracking-wider mb-3">Chats & Messages</h2>
              <input
                type="text"
                placeholder="Search contact or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 bg-gray-50 border border-gray-200 rounded-lg px-3 text-xs outline-none focus:border-jungle-green-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-150">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="p-4 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
                ))
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  <FaComments className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  No messages found
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
                        "p-4 cursor-pointer hover:bg-jungle-green-50/20 transition-colors flex gap-3 relative",
                        isSelected ? "bg-jungle-green-50/40 border-l-4 border-jungle-green-500 pl-3" : "bg-white"
                      )}
                    >
                      <Avatar name={recipient?.fullName || 'B2B Trade'} size="sm" className="rounded-lg shadow-sm shrink-0" />
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <p className="text-xs font-black text-gray-900 truncate uppercase tracking-tight">
                            {recipient?.fullName || 'Trade Partner'}
                          </p>
                          {conv.latestMessage && (
                            <span className="text-[9px] text-gray-400 font-semibold shrink-0">
                              {new Date(conv.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>

                        {recipient?.businessName && (
                          <p className="text-[10px] text-gray-500 font-bold truncate flex items-center gap-1">
                            <FaBuilding className="h-3 w-3 text-gray-450 shrink-0" /> {recipient.businessName}
                          </p>
                        )}

                        <p className={clsx(
                          "text-xs truncate mt-1.5",
                          isUnread ? "text-jungle-green-950 font-bold" : "text-gray-500 font-normal"
                        )}>
                          {conv.latestMessage?.content || 'Click to begin messaging'}
                        </p>
                      </div>

                      {isUnread && (
                        <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-jungle-green-500" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 2. Right Detail Panel (Chat Screen) */}
          <div className="flex-1 flex flex-col bg-white">
            {selectedConv ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedConv(null)} className="md:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">
                      <FaArrowLeft className="h-4 w-4" />
                    </button>
                    <Avatar name={selectedConv.recipient?.fullName} size="sm" className="rounded-lg shadow-sm" />
                    <div>
                      <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider leading-none">
                        {selectedConv.recipient?.fullName || 'Verified Trade Partner'}
                      </h3>
                      <p className="text-[10px] text-gray-450 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1">
                        <FaBuilding className="text-gray-400 shrink-0" /> {selectedConv.recipient?.businessName || 'Business Manufacturer'}
                      </p>
                    </div>
                  </div>

                  {/* B2B Context Link (RFQ or Order) */}
                  <div className="flex items-center gap-2">
                    {selectedConv.rfqId && (
                      <Link href={`/rfq/${selectedConv.rfqId}`}>
                        <button className="h-8 border border-jungle-green-200 text-jungle-green-600 bg-jungle-green-50/50 hover:bg-jungle-green-50 text-[10px] font-bold uppercase tracking-wider px-3 rounded-lg flex items-center gap-1">
                          <FaFileContract className="h-3.5 w-3.5" /> View RFQ
                        </button>
                      </Link>
                    )}
                    {selectedConv.orderId && (
                      <Link href={`/orders/${selectedConv.orderId}`}>
                        <button className="h-8 border border-jungle-green-200 text-jungle-green-600 bg-jungle-green-50/50 hover:bg-jungle-green-50 text-[10px] font-bold uppercase tracking-wider px-3 rounded-lg flex items-center gap-1">
                          <FaBoxesStacked className="h-3.5 w-3.5" /> View Order
                        </button>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Chat Message Logs */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 min-h-0">
                  {loadingMessages ? (
                    <div className="space-y-4">
                      <div className="h-10 bg-gray-200 rounded-lg w-1/3 animate-pulse" />
                      <div className="h-10 bg-gray-200 rounded-lg w-1/4 animate-pulse ml-auto" />
                      <div className="h-10 bg-gray-200 rounded-lg w-1/2 animate-pulse" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-20 text-xs text-gray-400">
                      <FaComments className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                      No messages in this chat. Start the negotiation!
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === user?.id;
                      return (
                        <div key={msg.id} className={clsx("flex flex-col max-w-[70%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                          <div
                            className={clsx(
                              "p-3 rounded-2xl text-xs leading-relaxed shadow-sm",
                              isMe
                                ? "bg-jungle-green-500 text-white rounded-tr-none"
                                : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
                            )}
                          >
                            {msg.content}
                          </div>
                          <span className="text-[9px] text-gray-400 font-semibold mt-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isMe && (
                              <span className={clsx("ml-1 font-bold", msg.isRead ? "text-jungle-green-500" : "text-gray-350")}>
                                {msg.isRead ? '• Read' : '• Sent'}
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Quick Negotiation Templates */}
                <div className="p-3 bg-white border-t border-gray-150 shrink-0">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Negotiation Templates</p>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {B2B_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(undefined, tmpl)}
                        className="bg-gray-50 hover:bg-jungle-green-50 hover:text-jungle-green-600 border border-gray-200 rounded-lg px-3 py-1.5 text-[10px] text-gray-600 font-semibold whitespace-nowrap transition-all shrink-0"
                      >
                        {tmpl.substring(0, 32)}...
                      </button>
                    ))}
                  </div>
                </div>

                {/* Messaging Footer Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white flex gap-3 shrink-0">
                  <input
                    type="text"
                    placeholder="Type your message here..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 h-10 border border-gray-200 rounded-xl px-4 text-xs outline-none focus:border-jungle-green-500 focus:bg-gray-50/30 transition-colors"
                  />
                  <button
                    type="submit"
                    className="h-10 w-10 bg-jungle-green-500 hover:bg-jungle-green-600 text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
                  >
                    <FaPaperPlane className="h-4 w-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50/20">
                <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-4 border border-gray-100">
                  <FaComments className="h-8 w-8 text-jungle-green-500" />
                </div>
                <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider">Message Center</h3>
                <p className="text-xs text-gray-500 max-w-sm text-center mt-1 leading-relaxed">
                  Select a supplier or buyer conversation from the left to negotiate pricing, request catalogs, and finalise bulk specifications.
                </p>
              </div>
            )}
          </div>

        </div>
      </Container>
    </PublicLayout>
  );
}
