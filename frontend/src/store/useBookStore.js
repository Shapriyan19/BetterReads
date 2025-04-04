import { create } from "zustand";
import axiosInstance from "../lib/axios";
import { toast } from "react-hot-toast";

export const useBookStore = create((set, get) => ({
    recommendedBooks: [],
    isLoading: false,
    isLoadingDetails: false,
    isLoadingReviews: false,
    bookReviews: [],
    averageRating: 0,
    totalRatings: 0,
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
    },
    
    // Get reviews for a specific book
    getReviews: async (bookName) => {
        set({ isLoadingReviews: true, error: null });
        try {
            const res = await axiosInstance.get("/book/get-review", {
                params: { bookName }
            });
            set({ bookReviews: res.data.reviews || [], isLoadingReviews: false });
            return res.data.reviews || [];
        } catch (error) {
            console.error('Error fetching reviews:', error);
            set({ error: error.response?.data?.message || "Failed to fetch reviews", isLoadingReviews: false });
            toast.error(error.response?.data?.message || "Failed to fetch reviews");
            throw error;
        }
    },
    
    // Post a new review
    postReview: async (reviewData) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.post("/book/post-review", reviewData);
            toast.success("Review submitted successfully!");
            return res.data;
        } catch (error) {
            console.error('Error posting review:', error);
            set({ error: error.response?.data?.message || "Failed to post review" });
            toast.error(error.response?.data?.message || "Failed to post review");
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },
    // Post a rating for a book
    postRating: async (ratingData) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.post("/book/post-rating", ratingData);
            set({
                averageRating: parseFloat(res.data.averageRating),
                totalRatings: res.data.totalRatings
            });
            toast.success("Rating submitted successfully!");
            return res.data;
        } catch (error) {
            console.error('Error posting rating:', error);
            set({ error: error.response?.data?.message || "Failed to post rating" });
            toast.error(error.response?.data?.message || "Failed to post rating");
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },
    // Get average rating for a book
    getAverageRating: async (bookName) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.get("/book/get-average-rating", {
                params: { bookName }
            });
            set({
                averageRating: parseFloat(res.data.averageRating),
                totalRatings: res.data.totalRatings
            });
            return res.data;
        } catch (error) {
            console.error('Error fetching average rating:', error);
            set({ error: error.response?.data?.message || "Failed to fetch average rating" });
            toast.error(error.response?.data?.message || "Failed to fetch average rating");
            throw error;
        } finally {
            set({ isLoading: false });
        }

    }
})); 