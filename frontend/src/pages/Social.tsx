import React, { useState } from "react";
import ChannelList from "@/components/social/ChannelList";
import MessageList from "@/components/social/MessageList";
import MessageComposer from "@/components/social/MessageComposer";
import NotificationToast from "@/components/social/NotificationToast";
import "@/styles/social.css";

const FEATURE_ON = import.meta.env.VITE_SOCIAL_WALL_ENABLED !== "false";

const Social = () => {
  if (!FEATURE_ON) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <p className="text-2xl text-gradient">Zwickly Social Wall is disabled.</p>
      </div>
    );
  }

  // FEATURE: Responsive, micro-interactions, banner toast
  const [userId] = useState(() => localStorage.getItem("userId") || "user-demo");
  const [userHandle] = useState(() => localStorage.getItem("userHandle") || "demoUser");
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [toast, setToast] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="zw-social-wall flex flex-col min-h-screen bg-gradient-to-br from-[#7B5CFA] to-[#48E0E4]">
      {/* Top notification banner on admin broadcast or major events */}
      <NotificationToast toast={toast} onClose={() => setToast(null)} position="top" />
      {/* Responsive wrapper */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* Collapsible sidebar on mobile */}
        <aside className={`zw-sidebar shadow-lg bg-white/90 rounded-r-3xl p-3 sm:p-4
            ${sidebarOpen ? "" : "hidden"}
            md:block`}
          style={{ position: "relative", zIndex: 10 }}>
          <ChannelList
            userId={userId}
            userHandle={userHandle}
            selectedChannelId={selectedChannel?.id}
            onSelect={setSelectedChannel}
            onToast={setToast}
          />
          <button
            className="sidebar-toggle md:hidden mt-3"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? "← Close" : "☰ Channels"}
          </button>
        </aside>

        <section className="zw-main-content flex flex-col flex-1">
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
                <MessageList
                  userId={userId}
                  userHandle={userHandle}
                  channel={selectedChannel}
                  onToast={setToast}
                />
              </div>
              <MessageComposer
                userId={userId}
                userHandle={userHandle}
                channel={selectedChannel}
                onToast={setToast}
              />
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
  );
};
export default Social;

