import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/Api.js";
import { useAuthStore } from "./checkAuth.jsx";

export const useChatStore = create(
  persist(
    (set, get) => ({
      messages: {},   
      users: [],
      selectedUser: null,
      isUsersLoading: false,
      isMessagesLoading: false,

      getUsers: async () => {
        set({ isUsersLoading: true });
        try {
          const res = await axiosInstance.get("/messages/users");
          set({ users: res.data });
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to fetch users");
        } finally {
          set({ isUsersLoading: false });
        }
      },

      getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
          const res = await axiosInstance.get(`/messages/${userId}`);
          set((state) => ({
            messages: {
              ...state.messages,
              [userId]: res.data, 
            },
          }));
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to fetch messages");
        } finally {
          set({ isMessagesLoading: false });
        }
      },

      sendMessage: async (messageData) => {
        const { selectedUser } = get();
        try {
          const res = await axiosInstance.post(
            `/messages/send/${selectedUser._id}`,
            messageData
          );

          set((state) => ({
            messages: {
              ...state.messages,
              [selectedUser._id]: [
                ...(state.messages[selectedUser._id] || []),
                res.data,
              ],
            },
          }));
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to send message");
        }
      },

      subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;
        if (!socket) {
          console.warn("Socket not connected yet. Call connectSocket() first.");
          return;
        }

        socket.on("newMessage", (newMessage) => {
          const { selectedUser } = get();
          if (
            newMessage.senderId === selectedUser._id ||
            newMessage.receiverId === selectedUser._id
          ) {
            set((state) => ({
              messages: {
                ...state.messages,
                [selectedUser._id]: [
                  ...(state.messages[selectedUser._id] || []),
                  newMessage,
                ],
              },
            }));
          }
        });
      },

      unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket?.off("newMessage");
      },

      setSelectedUser: (selectedUser) => {
        set({ selectedUser });
        if (selectedUser) {
          get().getMessages(selectedUser._id);
        }
      },
    }),
    {
      name: "chat-storage", 
    }
  )
);
