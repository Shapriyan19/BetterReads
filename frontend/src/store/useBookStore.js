import { create } from "zustand";
import axiosInstance from "../lib/axios";
import { toast } from "react-hot-toast";

export const useBookStore = create((set, get) => ({
    recommendedBooks: [],
    isLoading: false,
    isLoadingDetails: false,
    isLoadingReviews: false,
    isLoadingAvailability: false,
    isLoadingTracks: false,
    isLoadingAIReviewSummary: false,
    bookReviews: [],
    averageRating: 0,
    totalRatings: 0,
    availability: [],
    spotifyTracks: [],
    aiReviewSummary: "",
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
    },
    getAvailability: async (isbn) => {
        set({ isLoadingAvailability: true, error: null });
        try {
            // First try to get the title ID (BID)
            const bookDetails = await axiosInstance.post("/book/get-book-details", { bookISBN: isbn });
            const bid = bookDetails.data?.identifiers?.bibid?.[0] || bookDetails.data?.identifiers?.bnb?.[0];
            
            if (!bid && !isbn) {
                throw new Error("No valid identifier found for this book");
            }
            
            // Now get availability with either BID (preferred) or ISBN
            const res = await axiosInstance.post("/book/get-availability", { 
                bookName: isbn,
                bid: bid,
                fieldName: bid ? "BID" : "ISBN" // Specify which field we're using
            });
            
            set({ 
                isLoadingAvailability: false,
                availability: res.data.data?.items || []
            });
            return res.data.data?.items || [];
        } catch (error) {
            console.error('Error fetching book availability:', error);
            set({ 
                error: error.response?.data?.message || "Failed to fetch book availability",
                isLoadingAvailability: false 
            });
            throw error;
        }
    },
    getSpotifyTracks: async (bookCategory, bookName) => {
        set({ isLoadingTracks: true, error: null });
        try {
            console.log("Sending request with bookCategory:", bookCategory, "and bookName:", bookName);
            const res = await axiosInstance.post("/book/get-playlist", { bookCategory, bookName });
            console.log("Response from get-playlist:", res.data);
            set({ spotifyTracks: res.data.tracks || [], isLoadingTracks: false });
            return res.data.tracks || [];
        } catch (error) {
            console.error('Error fetching Spotify tracks:', error);
            set({ 
                error: error.response?.data?.message || "Failed to fetch Spotify tracks",
                isLoadingTracks: false 
            });
            toast.error(error.response?.data?.message || "Failed to fetch Spotify tracks");
            throw error;
        }
    },
    
    // Get AI review summary for a book
    getAIReviewSummary: async (bookName, authorName) => {
        set({ isLoadingAIReviewSummary: true, error: null, aiReviewSummary: "" });
        try {
            const res = await axiosInstance.get("/book/ai-review-summary", {
                params: { 
                    book_name: bookName,
                    auth_name: authorName
                }
            });
            
            let summaryText = "";
            
            // Check if the response is in JSON format
            if (res.data && res.data.summary) {
                try {
                    // Try to parse the summary if it's a JSON string
                    if (typeof res.data.summary === 'string' && res.data.summary.trim().startsWith('{')) {
                        const parsedSummary = JSON.parse(res.data.summary);
                        summaryText = parsedSummary.summary || "";
                    } else {
                        // If not a JSON string, use as is
                        summaryText = res.data.summary;
                    }
                } catch (parseError) {
                    console.error('Error parsing JSON summary:', parseError);
                    // Fallback to using the raw string
                    summaryText = res.data.summary;
                }
            }
            
            set({ 
                aiReviewSummary: summaryText,
                isLoadingAIReviewSummary: false 
            });
            return summaryText;
        } catch (error) {
            console.error('Error fetching AI review summary:', error);
            set({ 
                error: error.response?.data?.message || "Failed to fetch AI review summary",
                isLoadingAIReviewSummary: false 
            });
            throw error;
        }
    }
})); 