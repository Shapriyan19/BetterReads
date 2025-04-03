import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useClubStore = create((set) => ({
    clubs: [],
    currentClub: null,
    isLoading: false,
    error: null,

    // Create a new book club
    createClub: async (formData) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.post("/clubs", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success("Book club created successfully!");
            return res.data;
        } catch (error) {
            console.error('Error creating book club:', error);
            set({ error: error.response?.data?.message || "Failed to create book club" });
            toast.error(error.response?.data?.message || "Failed to create book club");
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    // Get all book clubs
    getClubs: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.get("/clubs");
            console.log('Raw API response:', res.data);
            console.log('Clubs data:', res.data.data);
            
            // Process the clubs data to ensure members is properly handled
            const processedClubs = res.data.data.map(club => ({
                ...club,
                members: club.roles.map(role => role.user),
                membersCount: club.roles.length
            }));
            
            console.log('Processed clubs:', processedClubs);
            set({ clubs: processedClubs });
            return processedClubs;
        } catch (error) {
            console.error('Error fetching book clubs:', error);
            set({ error: error.response?.data?.message || "Failed to fetch book clubs" });
            toast.error(error.response?.data?.message || "Failed to fetch book clubs");
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    // Get a single book club by ID
    getClub: async (clubId) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.get(`/clubs/${clubId}`);
            const club = {
                ...res.data.data,
                members: res.data.data.roles.map(role => role.user),
                membersCount: res.data.data.roles.length
            };
            set({ currentClub: club });
            return club;
        } catch (error) {
            console.error('Error fetching book club:', error);
            set({ error: error.response?.data?.message || "Failed to fetch book club" });
            toast.error(error.response?.data?.message || "Failed to fetch book club");
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    // Update a book club
    updateClub: async (clubId, clubData) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.put(`/clubs/${clubId}`, clubData);
            toast.success("Book club updated successfully!");
            return res.data;
        } catch (error) {
            console.error('Error updating book club:', error);
            set({ error: error.response?.data?.message || "Failed to update book club" });
            toast.error(error.response?.data?.message || "Failed to update book club");
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    // Delete a book club
    deleteClub: async (clubId) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.delete(`/clubs/${clubId}`);
            toast.success("Book club deleted successfully!");
            set((state) => ({
                clubs: state.clubs.filter(club => club._id !== clubId),
                currentClub: state.currentClub?._id === clubId ? null : state.currentClub
            }));
        } catch (error) {
            console.error('Error deleting book club:', error);
            set({ error: error.response?.data?.message || "Failed to delete book club" });
            toast.error(error.response?.data?.message || "Failed to delete book club");
            throw error;
        } finally {
            set({ isLoading: false });
        }
    }
})); 