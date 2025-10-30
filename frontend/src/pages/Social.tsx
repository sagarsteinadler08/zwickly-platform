import React, { useState, lazy, Suspense, useEffect } from "react";
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
      <div className="flex h-screen items-center justify-center bg-zinc-50" role="main">
        <div className="text-center p-8">
          <p className="text-2xl text-gradient mb-4">Zwickly Social Wall is disabled.</p>
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
      <div className="flex h-screen items-center justify-center bg-zinc-50" role="main">
        <div className="text-center">
          <div className="animate-pulse text-2xl text-gradient">Loading Social Wall...</div>
        </div>
      </div>
    );
  }

  return (
    <SocialErrorBoundary>
      <div className="zw-social-wall flex flex-col min-h-screen bg-gradient-to-br from-[#7B5CFA] to-[#48E0E4]">
        {/* Top notification banner on admin broadcast or major events */}
        <NotificationToast toast={toast} onClose={() => setToast(null)} position="top" />
        {/* Responsive wrapper */}
        <main className="flex flex-1 overflow-hidden relative" role="main">
          {/* Collapsible sidebar on mobile */}
          <aside 
            className={`zw-sidebar shadow-lg bg-white/90 rounded-r-3xl p-3 sm:p-4
            ${sidebarOpen ? "" : "hidden"} md:block`}
            style={{ position: "relative", zIndex: 10 }}
            aria-label="Channel list sidebar"
          >
            <Suspense fallback={<div className="py-4 text-muted">Loading channels...</div>}>
              <ChannelList
                userId={userId}
                userHandle={userHandle}
                selectedChannelId={selectedChannel?.id}
                onSelect={setSelectedChannel}
                onToast={setToast}
              />
            </Suspense>
            <button
              className="sidebar-toggle md:hidden mt-3"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? "← Close" : "☰ Channels"}
            </button>
          </aside>

          <section className="zw-main-content flex flex-col flex-1" aria-label="Main chat area">
            {/* Mobile toggle for sidebar */}
            <button
              className="sidebar-toggle absolute top-2 left-2 z-20 md:hidden"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? "←" : "☰"}
            </button>
            {selectedChannel ? (
              <>
                <div className="zw-channel-header bg-white/60 rounded-lg mt-4 px-6 py-2 shadow-sm flex items-center">
                  <span className="text-xl font-bold text-gradient">{selectedChannel.name}</span>
                  <span className="ml-2 text-xs opacity-75">{selectedChannel.description}</span>
                </div>
                <div className="flex-1 flex flex-col justify-end min-h-0">
                  <Suspense fallback={<div className="py-4 text-center text-muted">Loading messages...</div>}>
                    <MessageList
                      userId={userId}
                      userHandle={userHandle}
                      channel={selectedChannel}
                      onToast={setToast}
                    />
                  </Suspense>
                </div>
                <Suspense fallback={<div className="p-2 bg-white/90 rounded-2xl">Loading composer...</div>}>
                  <MessageComposer
                    userId={userId}
                    userHandle={userHandle}
                    channel={selectedChannel}
                    onToast={setToast}
                  />
                </Suspense>
              </>
            ) : (
              <div className="flex flex-1 flex-col justify-center items-center">
                <p className="text-gray-500">Select or join a channel to get started.</p>
              </div>
            )}
          </section>
          <NotificationToast toast={toast} onClose={() => setToast(null)} />
        </main>
      </div>
    </SocialErrorBoundary>
  );
};

export default Social;

