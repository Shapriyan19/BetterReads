import {create} from "zustand";
import {axiosInstance} from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set,get)=>({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,

    isCheckingAuth: true,

    checkAuth: async () => {
      try {
        console.log("Hello World");
        const res = await axiosInstance.get("/auth/check");
        console.log("Hiii");
        set({ authUser: res.data });
      } catch (error) {
        console.log("Error in checkAuth:", error);
        set({ authUser: null });
      } finally {
        set({ isCheckingAuth: false });
      }
    },

    signup: async (data) => {
      set({ isSigningUp: true });
      try {
          const res = await axiosInstance.post("/auth/signup", data);
          
          console.log("Signup response:", res); // Log entire response
          
          if (!res || !res.data) {
              throw new Error("Invalid response from server");
          }
  
          set({ authUser: res.data });
          console.log("AuthUser stored:", res.data); // Log stored data
          console.log("SignUp successful")
          toast.success("Account created successfully");
      } catch (error) {
          console.error("Error in signUp(useAuthStore):", error);
          toast.error(error?.response?.data?.message || "Signup failed");
      } finally {
          set({ isSigningUp: false });
      }
  },  

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
          const res = await axiosInstance.post("/auth/login", data);
          set({ authUser: res.data });
          toast.success("Logged in successfully");
        } catch (error) {
          toast.error(error.response.data.message);
        } finally {
          set({ isLoggingIn: false });
        }
      },

    logout: async () => {
        try {
          await axiosInstance.post("/auth/logout");
          set({ authUser: null });
          toast.success("Logged out successfully");
        } catch (error) {
          toast.error(error.response.data.message);
        }
    },
}));