import React, { useEffect } from "react";
const icons: any = {
  info: "💬", mention: "🔔", poll: "📊", admin: "📰", error: "⚠️",
};
const NotificationToast: React.FC<{ toast: any; onClose: () => void; position?: "top" | "bottom" }> = ({
  toast, onClose, position = "bottom"
}) => {
  useEffect(() => { if (toast) { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); } }, [toast]);
  if (!toast) return null;
  return (
    <div className={`fixed ${position === "top" ? "top-6 left-1/2 -translate-x-1/2" : "bottom-6 right-6"} z-[99] zw-toast shadow-lg px-6 py-4 rounded-xl animate-toastIn`}>
      <span className="mr-2">{icons[toast.type || "info"]}</span>
      <span>{toast.message}</span>
      {toast.url && <a className="ml-3 underline text-blue-50" href={toast.url}>View</a>}
      <span className="ml-4 cursor-pointer text-xl" onClick={onClose}>×</span>
    </div>
  );
};
export default NotificationToast;
