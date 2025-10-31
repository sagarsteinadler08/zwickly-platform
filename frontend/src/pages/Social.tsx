import React, { useState, lazy, Suspense, useEffect } from "react";
import Navbar from "@/components/Navbar";
import NotificationToast from "@/components/social/NotificationToast";
import "@/styles/social.css";

// Lazy load components for better performance
const ChannelList = lazy(() => import("@/components/social/ChannelList"));
const MessageList = lazy(() => import("@/components/social/MessageList"));
const MessageComposer = lazy(() => import("@/components/social/MessageComposer"));

const FEATURE_ON = import.meta.env.VITE_SOCIAL_WALL_ENABLED !== "false";

// Error Boundary Component
class SocialErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[SocialWall] Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-zinc-50">
          <div className="text-center p-8">
            <p className="text-2xl font-bold text-red-600 mb-4">Social Wall Error</p>
            <p className="text-gray-600 mb-4">
              The social wall encountered an error. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const Social = () => {
  // SSR-safe localStorage access
  const [userId, setUserId] = useState<string>("user-demo");
  const [userHandle, setUserHandle] = useState<string>("demoUser");
  const [isClient, setIsClient] = useState(false);
  const [unreadCount] = useState(2); // TODO: Fetch from notifications API

  useEffect(() => {
    setIsClient(true);
    setUserId(localStorage.getItem("userId") || "user-demo");
    setUserHandle(localStorage.getItem("userHandle") || "demoUser");
  }, []);

  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [toast, setToast] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!FEATURE_ON) {
    return (
      <div className="flex h-screen items-center justify-center bg-white" role="main">
        <div className="text-center p-8">
          <p className="text-2xl font-bold text-gray-800 mb-4">Social Wall is disabled.</p>
          <p className="text-gray-600 mb-4">
            This feature is currently unavailable. Please contact the administrator.
          </p>
          <a
            href="/admin/social"
            className="text-blue-600 hover:underline"
            aria-label="Go to admin portal"
          >
            Admin Portal →
          </a>
        </div>
      </div>
    );
  }

  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-white" role="main">
        <div className="text-center">
          <div className="animate-pulse text-2xl font-bold text-gray-800">Loading Social Wall...</div>
        </div>
      </div>
    );
  }

  return (
    <SocialErrorBoundary>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0F172A] transition-colors duration-300">
        <Navbar />

        <div className="flex flex-1 pt-20">
          {/* Responsive wrapper */}
          <main className="flex flex-1 overflow-hidden relative bg-slate-50 dark:bg-[#0F172A] w-full transition-colors duration-300" role="main">
          {/* Notification Toast */}
          <NotificationToast toast={toast} onClose={() => setToast(null)} position="top" />

          {/* Collapsible sidebar on mobile */}
          <aside
            className={`bg-white dark:bg-[#1E293B]/80 backdrop-blur-xl border-r border-slate-200 dark:border-white/10 shadow-sm shadow-slate-200/50 dark:shadow-purple-500/10
            ${sidebarOpen ? "" : "hidden"} md:block`}
            aria-label="Channel list sidebar"
            style={{ width: "280px", minWidth: "280px" }}
          >
            <div className="p-4">
              <Suspense fallback={<div className="py-4 text-slate-500 dark:text-gray-500">Loading channels...</div>}>
                <ChannelList
                  userId={userId}
                  userHandle={userHandle}
                  selectedChannelId={selectedChannel?.id}
                  onSelect={setSelectedChannel}
                  onToast={setToast}
                />
              </Suspense>
            </div>
          </aside>

          <section className="flex flex-col flex-1 bg-slate-50 dark:bg-[#0F172A] transition-colors duration-300" aria-label="Main chat area">
            {/* Mobile toggle for sidebar */}
            <button
              className="absolute top-2 left-2 z-20 md:hidden bg-white dark:bg-white/10 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-slate-200 dark:border-white/20 text-slate-700 dark:text-white"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? "←" : "☰"}
            </button>

            {selectedChannel ? (
              <>
                {/* Message List */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-[#0F172A] transition-colors duration-300">
                  <Suspense fallback={<div className="py-4 text-center text-slate-500 dark:text-gray-500">Loading messages...</div>}>
                    <MessageList
                      userId={userId}
                      userHandle={userHandle}
                      channel={selectedChannel}
                      onToast={setToast}
                    />
                  </Suspense>
                </div>

                {/* Message Composer */}
                <div className="border-t border-slate-200 dark:border-white/10 p-4 bg-white dark:bg-[#1E293B]/50 backdrop-blur-xl transition-colors duration-300">
                  <Suspense fallback={<div className="p-4 bg-slate-50 dark:bg-gray-800 rounded-lg text-slate-500 dark:text-gray-400">Loading composer...</div>}>
                    <MessageComposer
                      userId={userId}
                      userHandle={userHandle}
                      channel={selectedChannel}
                      onToast={setToast}
                    />
                  </Suspense>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col justify-center items-center">
                <p className="text-slate-500 dark:text-gray-400 text-lg">Select or join a channel to get started</p>
              </div>
            )}
          </section>
        </main>
        </div>
      </div>
    </SocialErrorBoundary>
  );
};

export default Social;
