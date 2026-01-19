import { useEffect, useState, useRef } from "react";
import { ref, onValue, push, onDisconnect, set, remove } from "firebase/database";
import { database } from "../firebase-config";

export function useLiveUsers(trackPresence = true) {
    const [onlineCount, setOnlineCount] = useState(0);
    const userRef = useRef(null);

    useEffect(() => {
        let unsubscribeConnected = () => { };

        if (trackPresence) {
            const connectedRef = ref(database, ".info/connected");
            const onlineUsersRef = ref(database, "status/online");

            unsubscribeConnected = onValue(connectedRef, (snap) => {
                if (snap.val() === true) {
                    // Start fresh: remove previous ref if exists
                    if (userRef.current) {
                        remove(userRef.current).catch(() => { });
                    }

                    const myUserRef = push(onlineUsersRef);
                    userRef.current = myUserRef;

                    // Server-side cleanup on socket disconnect
                    onDisconnect(myUserRef).remove();

                    // Set online
                    set(myUserRef, true);
                }
            });
        }

        const onlineUsersRef = ref(database, "status/online");
        const countUnsubscribe = onValue(onlineUsersRef, (snap) => {
            if (snap.exists()) {
                setOnlineCount(Object.keys(snap.val()).length);
            } else {
                setOnlineCount(0);
            }
        });

        return () => {
            // Client-side cleanup on unmount/re-render
            if (trackPresence && userRef.current) {
                remove(userRef.current).catch(() => { });
            }
            unsubscribeConnected();
            countUnsubscribe();
        };
    }, [trackPresence]);

    return onlineCount;
}
