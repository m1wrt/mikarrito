import { useEffect, useRef } from "react";
import { collection, query, orderBy, limit, onSnapshot, doc, setDoc } from "firebase/firestore";
import { db, getToken, onMessage, getMessagingInstance } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function NotificationManager() {
  const { currentUser } = useAuth();
  const lastPostRef = useRef(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!currentUser) return;

    let unsubscribeMessaging = () => {};

    const setupPushNotifications = async () => {
      try {
        if (!("Notification" in window)) return;
        
        const messaging = await getMessagingInstance();
        if (!messaging) return;

        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const token = await getToken(messaging, { 
            vapidKey: "YOUR_VAPID_KEY_HERE" 
          });
          
          if (token) {
            await setDoc(doc(db, "users", currentUser.uid), {
              fcmToken: token
            }, { merge: true });
          }

          unsubscribeMessaging = onMessage(messaging, (payload) => {
            toast.info(`${payload.notification.title}: ${payload.notification.body}`);
          });
        }
      } catch (error) {
        console.error("Error setting up push notifications:", error);
      }
    };

    setupPushNotifications();

    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) return;
      const latestPost = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };

      if (isInitialLoad.current) {
        lastPostRef.current = latestPost.id;
        isInitialLoad.current = false;
        return;
      }

      if (latestPost.id !== lastPostRef.current && latestPost.userId !== currentUser.uid) {
        lastPostRef.current = latestPost.id;
        toast.info(`New post from ${latestPost.userName || "someone"}!`);
      }
    });

    return () => {
      unsubscribeMessaging();
      unsubscribeFirestore();
    };
  }, [currentUser]);

  return null;
}
