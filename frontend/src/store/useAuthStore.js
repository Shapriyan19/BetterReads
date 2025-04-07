import {create} from "zustand";
import axiosInstance from "../lib/axios";
import { toast } from "react-hot-toast";

export const useAuthStore = create((set,get)=>({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,

    checkAuth: async () => {
      try {
        const res = await axiosInstance.get("/auth/check");
        set({ authUser: res.data });
      } catch (error) {
        console.log("Error in checkAuth:", error);
        set({ authUser: null });
      } finally {
        set({ isCheckingAuth: false });
      }
    },

    // In useAuthStore.js, update the signup function
    signup: async (data) => {
      set({ isSigningUp: true });
      try {
          // Convert FormData to a more readable format for logging
          const formDataObject = {};
          for (let [key, value] of data.entries()) {
              // Handle array-like keys (e.g., 'preferences[]')
              if (key.endsWith('[]')) {
                  const baseKey = key.slice(0, -2);
                  if (!formDataObject[baseKey]) {
                      formDataObject[baseKey] = [];
                  }
                  formDataObject[baseKey].push(value);
              } else {
                  formDataObject[key] = value;
              }
          }
          console.log("Sending signup data:", formDataObject);
          
          const res = await axiosInstance.post("/auth/signup", data, {
              headers: {
                  'Content-Type': 'multipart/form-data'
              }
          });
          
          if (!res || !res.data) {
              throw new Error("Invalid response from server");
          }

          set({ authUser: res.data });
          toast.success("Account created successfully");
          return res.data;
      } catch (error) {
          console.error("Signup error details:", {
              message: error.response?.data?.message || error.message,
              status: error.response?.status,
              data: error.response?.data
          });
          throw error;
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
            toast.error(error.response?.data?.message || "Login failed");
            throw error;
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
            toast.error(error.response?.data?.message || "Logout failed");
            throw error;
        }
    },

    sendForgotPasswordPin: async (email) => {
        try {
            const res = await axiosInstance.post("/auth/forgot-password/send-pin", { email });
            return res.data;
        } catch (error) {
            console.error('Error sending forgot password PIN:', error);
            throw error;
        }
    },

    verifyForgotPasswordPin: async (email, forgotPasswordPin) => {
        try {
            const res = await axiosInstance.post("/auth/forgot-password/verify-pin", { 
                email,
                forgotPasswordPin 
            });
            return res.data;
        } catch (error) {
            console.error('Error verifying forgot password PIN:', error);
            throw error;
        }
    },

    updatePassword: async (email, newPassword) => {
        try {
            const res = await axiosInstance.post("/auth/forgot-password/update", { 
                email,
                newPassword 
            });
            return res.data;
        } catch (error) {
            console.error('Error updating password:', error);
            throw error;
        }
    },

    updateProfile: async (formData) => {
        set({ isUpdatingProfile: true });
        try {
            console.log("Sending profile picture update request...");
            const res = await axiosInstance.put("/auth/update-profile", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log("Profile update response:", res.data);
            set({ authUser: res.data });
            toast.success("Profile picture updated successfully!");
            return res.data;
        } catch (error) {
            console.error("Error updating profile:", error);
            console.error("Error details:", error.response?.data);
            toast.error(error.response?.data?.message || "Failed to update profile picture");
            throw error;
        } finally {
            set({ isUpdatingProfile: false });
        }
    },
}));