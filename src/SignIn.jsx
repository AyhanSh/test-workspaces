// src/components/SignIn.js
import React from "react";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";

const SignIn = () => {
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google Sign-In Error:", error.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Sign In</h2>
      <button
        onClick={handleGoogleSignIn}
        style={{ padding: "10px 20px", cursor: "pointer" }}
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default SignIn;
