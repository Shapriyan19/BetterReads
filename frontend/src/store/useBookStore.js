import { create } from "zustand";
import axiosInstance from "../lib/axios";
import { toast } from "react-hot-toast";

export const useBookStore = create((set, get) => ({
    recommendedBooks: [],
    isLoading: false,
    isLoadingDetails: false,
    error: null,

    getRecommendedBooks: async (email) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.post("/book/recommended-books", { email });
            set({ recommendedBooks: res.data });
            return res.data;
        } catch (error) {
            console.error('Error fetching recommended books:', error);
            set({ error: error.response?.data?.message || "Failed to fetch recommended books" });
            toast.error(error.response?.data?.message || "Failed to fetch recommended books");
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    getBookDetails: async (isbn) => {
        set({ isLoadingDetails: true, error: null });
        try {
            const res = await axiosInstance.post("/book/get-book-details", { bookISBN: isbn });
            set({ isLoadingDetails: false });
            return res.data;
        } catch (error) {
            console.error('Error fetching book details:', error);
            set({ error: error.response?.data?.message || "Failed to fetch book details" });
            toast.error(error.response?.data?.message || "Failed to fetch book details");
            set({ isLoadingDetails: false });
            throw error;
        }
    },

    searchBooks: async (query) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.get("/book/search", {
                params: { book: query }
            });
            return res.data;
        } catch (error) {
            console.error('Error searching books:', error);
            set({ error: error.response?.data?.message || "Failed to search books" });
            toast.error(error.response?.data?.message || "Failed to search books");
            throw error;
        } finally {
            set({ isLoading: false });
        }
    }
})); 