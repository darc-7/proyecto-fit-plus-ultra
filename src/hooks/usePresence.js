import { useEffect } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";

export function usePresence(userId) {
  useEffect(() => {
    if (!userId) return;

    const userRef = doc(db, "users", userId);

    const goOnline = () => {
      updateDoc(userRef, { status: "online", lastSeen: serverTimestamp() })
        .catch(() => {});
    };

    const goOffline = () => {
      updateDoc(userRef, { status: "offline", lastSeen: serverTimestamp() })
        .catch(() => {});
    };

    goOnline();

    const heartbeat = setInterval(goOnline, 45000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        goOnline();
      } else {
        goOffline();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    window.addEventListener("beforeunload", goOffline);

    return () => {
      clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", goOffline);
      goOffline();
    };
  }, [userId]);
}