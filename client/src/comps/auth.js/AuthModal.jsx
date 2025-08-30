import { useEffect } from "react";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import { useAuth } from "@/context/auth";
import { securedApi } from "../api";
import BookCard from "../BookCard";

export default function AuthModal({ isOpen, signin, onClose, switchMode }) {
  const { token, setToken, setCurrUser, setLoggedIn } = useAuth()

  useEffect(() => {
    // console.log("Halo")
    setToken(localStorage.getItem("authToken") || null)
    let user = localStorage.getItem("user")
    user = JSON.parse(user)
    // console.log(user)
    if(!user){
      return
    }

    const getUser = async (userId)=>{
      try {
        // console.log(userId)
        const newData = await securedApi.get(`/api/user/${userId}`)
        // console.log(newData)
        
        if(newData.data.success){
          setCurrUser(newData.data.user)
          setLoggedIn(true)
        }

      } catch (error) {
        console.log(error)
      }
    }

    getUser(user.id)
  
  }, [token])
  

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
