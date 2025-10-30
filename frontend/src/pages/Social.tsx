import React, { useState, lazy, Suspense, useEffect } from "react";
import NotificationToast from "@/components/social/NotificationToast";
import { Bell, User } from "lucide-react";
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
      <div className="flex flex-col h-screen bg-white">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">KommPakt Social Wall</h1>
            {selectedChannel && (
              <p className="text-sm text-gray-600 mt-1"># {selectedChannel.name}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative" aria-label="Notifications">
              <Bell className="w-6 h-6 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {/* User Profile */}
            <button aria-label="Profile">
              <User className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </header>

        {/* Responsive wrapper */}
        <main className="flex flex-1 overflow-hidden relative bg-gray-50" role="main">
          {/* Notification Toast */}
          <NotificationToast toast={toast} onClose={() => setToast(null)} position="top" />

          {/* Collapsible sidebar on mobile */}
          <aside 
            className={`bg-white border-r border-gray-200 shadow-sm
            ${sidebarOpen ? "" : "hidden"} md:block`}
            aria-label="Channel list sidebar"
            style={{ width: "280px", minWidth: "280px" }}
          >
            <div className="p-4">
              <Suspense fallback={<div className="py-4 text-gray-500">Loading channels...</div>}>
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

          <section className="flex flex-col flex-1 bg-white" aria-label="Main chat area">
            {/* Mobile toggle for sidebar */}
            <button
              className="absolute top-2 left-2 z-20 md:hidden bg-white p-2 rounded-lg shadow-md"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? "←" : "☰"}
            </button>

            {selectedChannel ? (
              <>
                {/* Message List */}
                <div className="flex-1 overflow-y-auto p-6 bg-white">
                  <Suspense fallback={<div className="py-4 text-center text-gray-500">Loading messages...</div>}>
                    <MessageList
                      userId={userId}
                      userHandle={userHandle}
                      channel={selectedChannel}
                      onToast={setToast}
                    />
                  </Suspense>
                </div>

                {/* Message Composer */}
                <div className="border-t border-gray-200 p-4 bg-white">
                  <Suspense fallback={<div className="p-4 bg-gray-50 rounded-lg">Loading composer...</div>}>
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
                <p className="text-gray-500 text-lg">Select or join a channel to get started</p>
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
