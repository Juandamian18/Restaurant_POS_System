import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const cartSlice = createSlice({
    name : "cart",
    initialState,
    reducers : {
        addItems : (state, action) => {
            state.push(action.payload);
        },

        removeItem: (state, action) => {
            return state.filter(item => item.id != action.payload);
        },

        removeAllItems: (state) => {
            return [];
        },
        // Action to replace the current cart with items from an existing order
        loadCartFromOrder: (state, action) => {
            // action.payload should be the items array from the fetched order
            if (Array.isArray(action.payload)) {
                return action.payload; // Replace state with the loaded items
            }
            return state; // Return current state if payload is invalid
        }
    }
})

export const getTotalPrice = (state) => state.cart.reduce((total, item) => total + item.price, 0);
export const { addItems, removeItem, removeAllItems, loadCartFromOrder } = cartSlice.actions; // Export new action
export default cartSlice.reducer;
