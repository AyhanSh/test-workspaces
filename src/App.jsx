// src/App.js
import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import ChatUI from "./Chat";
import SignIn from "./SignIn";

const App = () => {
  const [user] = useAuthState(auth);

  return <div>{user ? <ChatUI user={user} /> : <SignIn />}</div>;
};

export default App;
