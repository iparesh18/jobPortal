import { createSlice } from "@reduxjs/toolkit";

const savedJobSlice = createSlice({
    name: "savedJob",
    initialState: {
        savedJobs: [],
    },
    reducers: {
        setSavedJobs: (state, action) => {
            state.savedJobs = action.payload;
        },
        addSavedJob: (state, action) => {
            state.savedJobs.push(action.payload);
        },
        removeSavedJob: (state, action) => {
            state.savedJobs = state.savedJobs.filter(
                (job) => job._id !== action.payload
            );
        },
    },
});

export const {
    setSavedJobs,
    addSavedJob,
    removeSavedJob,
} = savedJobSlice.actions;

export default savedJobSlice.reducer;