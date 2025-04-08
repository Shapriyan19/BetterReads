import { create } from "zustand";
import axiosInstance from "../lib/axios";
import { toast } from "react-hot-toast";

export const useClubStore = create((set, get) => ({
    clubs: [],
    userClubs: [],
    currentClub: null,
    isLoading: false,
    error: null,

    // Create a new book club
    createClub: async (formData) => {
        set({ isLoading: true, error: null });
        try {
            // Log the FormData contents
            console.log('Sending FormData:');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            const res = await axiosInstance.post("/clubs", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
                transformRequest: [(data) => {
                    // Don't transform FormData
                    return data;
                }],
            });
            
            if (res.data.success) {
                // Add the new club to the clubs array
                set((state) => ({
                    clubs: [...state.clubs, res.data.data],
                    userClubs: [...state.userClubs, res.data.data]
                }));
                
                toast.success("Book club created successfully!");
                return res.data;
            } else {
                throw new Error(res.data.message || "Failed to create book club");
            }
        } catch (error) {
            console.error('Error creating book club:', error);
            console.error('Error response:', error.response?.data);
            set({ error: error.response?.data?.message || "Failed to create book club" });
            toast.error(error.response?.data?.message || "Failed to create book club");
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    // Join a club
    joinClub: async (clubId) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.post(`/membership/${clubId}/join`);
            toast.success("Successfully joined the club!");
            
            // Update clubs and userClubs state locally
            set((state) => {
                const updatedClubs = state.clubs.map(club => {
                    if (club._id === clubId) {
                        // Add the current user to the club's roles
                        const updatedClub = {
                            ...club,
                            roles: [...club.roles, { role: 'member', user: res.data.data.roles[res.data.data.roles.length - 1].user }],
                            membersCount: club.membersCount + 1
                        };
                        return updatedClub;
                    }
                    return club;
                });

                // Add the joined club to userClubs
                const joinedClub = updatedClubs.find(club => club._id === clubId);
                const updatedUserClubs = [...state.userClubs, joinedClub];

                return {
                    clubs: updatedClubs,
                    userClubs: updatedUserClubs,
                    isLoading: false
                };
            });
            
            return res.data;
        } catch (error) {
            console.error('Error joining club:', error);
            set({ error: error.response?.data?.message || "Failed to join club", isLoading: false });
            toast.error(error.response?.data?.message || "Failed to join club");
            throw error;
        }
    },

    // Get all book clubs
    getClubs: async () => {
        set({ isLoading: true, error: null });
        try {
            console.log('Fetching clubs...');
            const res = await axiosInstance.get("/clubs");
            console.log('Clubs response:', res.data);
            
            // Process the clubs data to ensure members is properly handled
            const processedClubs = res.data.data.map(club => ({
                ...club,
                members: club.roles.map(role => role.user),
                membersCount: club.roles.length
            }));
            
            console.log('Processed clubs:', processedClubs);
            set({ clubs: processedClubs, isLoading: false });
            return processedClubs;
        } catch (error) {
            console.error('Error fetching book clubs:', error);
            console.error('Error response:', error.response?.data);
            set({ error: error.response?.data?.message || "Failed to fetch book clubs", isLoading: false });
            toast.error(error.response?.data?.message || "Failed to fetch book clubs");
            throw error;
        }
    },

    // Get a single book club by ID
    getClub: async (clubId) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.get(`/clubs/${clubId}`);
            console.log('Fetched club data:', res.data);
            
            // Process the club data to ensure members is properly handled
            const club = {
                ...res.data.data,
                members: res.data.data.roles.map(role => role.user),
                membersCount: res.data.data.roles.length
            };
            
            console.log('Processed club data:', club);
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
            
            // Process the club data to ensure members is properly handled
            const updatedClub = {
                ...res.data.data,
                members: res.data.data.roles.map(role => role.user),
                membersCount: res.data.data.roles.length
            };
            
            // Update the clubs and userClubs arrays with the updated club data
            set((state) => ({
                clubs: state.clubs.map(club => 
                    club._id === clubId ? updatedClub : club
                ),
                userClubs: state.userClubs.map(club => 
                    club._id === clubId ? updatedClub : club
                ),
                currentClub: state.currentClub?._id === clubId ? updatedClub : state.currentClub
            }));
            
            toast.success("Book club updated successfully!");
            return { data: updatedClub };
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
    },

    // Get user's clubs
    getUserClubs: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.get("/clubs/my-clubs");
            const processedClubs = res.data.data.map(club => ({
                ...club,
                members: club.roles.map(role => role.user),
                membersCount: club.roles.length
            }));
            set({ userClubs: processedClubs, isLoading: false });
            return processedClubs;
        } catch (error) {
            console.error('Error fetching user clubs:', error);
            set({ error: error.response?.data?.message || "Failed to fetch your clubs", isLoading: false });
            toast.error(error.response?.data?.message || "Failed to fetch your clubs");
            throw error;
        }
    },

    // Get club members with details
    getClubMembers: async (clubId) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.get(`/membership/${clubId}/members`);
            console.log('Members response:', res.data); // Add logging
            if (res.data.success) {
                return res.data.data;
            } else {
                throw new Error(res.data.message || 'Failed to fetch members');
            }
        } catch (error) {
            console.error('Error fetching club members:', error);
            set({ error: error.response?.data?.message || "Failed to fetch club members", isLoading: false });
            toast.error(error.response?.data?.message || "Failed to fetch club members");
            throw error;
        } finally {
            set({ isLoading: false });
        }
    }
})); 