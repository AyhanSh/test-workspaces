import React, { useState, useEffect } from "react";
import "./Chat.css";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  onSnapshot,
  setDoc,
  query,
  orderBy,
} from "firebase/firestore";
import axios from "axios";
import { useRef } from "react";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sendToGPT, setSendToGPT] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const chatBodyRef = useRef(null);
  const user = auth.currentUser;

  // Track active users
  useEffect(() => {
    const userRef = doc(db, "active_users", user.uid);

    // Add the current user to active_users when they enter the chat
    const addUserToActiveList = async () => {
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName,
      });
    };
    addUserToActiveList();

    // Remove the user from active_users when they leave the chat
    const handleBeforeUnload = async () => {
      await deleteDoc(userRef);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [user]);
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);
  // Fetch and update active users in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "active_users"),
      (snapshot) => {
        const users = snapshot.docs.map((doc) => doc.data());
        setActiveUsers(users);
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch messages in real-time
  useEffect(() => {
    const q = query(collection(db, "shared_chatroom"), orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, []);

  // Send a message
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = {
      text: input,
      sender: user.displayName || "Anonymous",
      senderAvatar: user.photoURL || "https://via.placeholder.com/35",
      toGPT: sendToGPT,
      createdAt: new Date(),
    };

    await addDoc(collection(db, "shared_chatroom"), newMessage);
    setInput("");

    if (sendToGPT) {
      await sendToGPTHandler(input);
    }
  };

  // Handle GPT messages
  const sendToGPTHandler = async (userMessage) => {
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [{ role: "user", content: userMessage }],
          max_tokens: 150,
        },
        {
          headers: {
            Authorization: `Bearer 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`,
          },
        }
      );

      const gptMessage = response.data.choices[0].message.content;

      await addDoc(collection(db, "shared_chatroom"), {
        text: gptMessage,
        sender: "GPT",
        senderAvatar: "https://i.imgur.com/rFbS5ms.png", // Replace with your GPT avatar image URL
        toGPT: false,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Error communicating with GPT:", error);
    }
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>Direct Messages</h3>
        </div>

        {/* Active Users Tab */}
        <div className="active-users-tab" ref={chatBodyRef}>
          <h4>Active Users</h4>
          <ul className="active-users-list">
            {activeUsers.map((user, index) => (
              <li key={index} className="active-user-item">
                <img
                  src={user.senderAvatar}
                  alt={`${user.displayName}'s avatar`}
                  className="avatar"
                />
                <div className="user-info">
                  <strong>{user.displayName}</strong>
                  <p>{user.email}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <button className="sign-out" onClick={() => auth.signOut()}>
          Sign Out
        </button>
      </div>

      {/* Chat Section */}
      <div className="chat-section">
        {/* Chat Body */}
        <div className="chat-body" ref={chatBodyRef}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.toGPT ? "sent" : "received"}`}
            >
              <img
                src={msg.senderAvatar}
                alt={`${msg.sender}'s avatar`}
                className="avatar"
              />
              <div className="message-content">
                <strong>{msg.sender}</strong>
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="message-input">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <label>
            <input
              type="checkbox"
              checked={sendToGPT}
              onChange={() => setSendToGPT(!sendToGPT)}
            />
            GPT
          </label>
          <button className="send-button" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
