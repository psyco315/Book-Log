import { useEffect } from "react";
import SignIn from "./SignIn";
import SignUp from "./SignUp";

export default function AuthModal({ isOpen, signin, onClose, switchMode }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden"; // lock html too
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return signin ? (
    <SignIn isOpen={isOpen} onClose={onClose} onSwitchToSignUp={() => switchMode(false)} />
  ) : (
    <SignUp isOpen={isOpen} onClose={onClose} onSwitchToSignIn={() => switchMode(true)} />
  );
}
