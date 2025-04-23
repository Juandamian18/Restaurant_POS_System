import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    orderId: "", // This seems unused? Maybe intended for the current active order ID?
    customerName: "",
    customerPhone: "",
    guests: 0,
    table: null, // Holds the selected table object { _id, tableNo, status, currentOrder? }
    currentOrderId: null // Explicitly store the ID of the active order for the selected table
}


const customerSlice = createSlice({
    name : "customer",
    initialState,
    reducers : {
        setCustomer: (state, action) => {
            const { name, phone, guests } = action.payload;
            state.orderId = `${Date.now()}`;
            state.customerName = name;
            state.customerPhone = phone;
            state.guests = guests;
        },

        removeCustomer: (state) => {
            state.customerName = "";
            state.customerPhone = "";
            state.guests = 0;
            state.table = null;
            state.currentOrderId = null; // Reset currentOrderId too
        },

        updateTable: (state, action) => {
            const selectedTable = action.payload.table;
            state.table = selectedTable;
            // Store the currentOrder ID if it exists on the selected table object
            state.currentOrderId = selectedTable?.currentOrder?._id || selectedTable?.currentOrder || null;
            // Also potentially load customer details if associated with the current order? (Future enhancement)
            // state.customerName = selectedTable?.currentOrder?.customerDetails?.name || "";
            // state.customerPhone = selectedTable?.currentOrder?.customerDetails?.phone || "";
            // state.guests = selectedTable?.currentOrder?.customerDetails?.guests || 0;
        },

        // Action to explicitly set the currentOrderId after creating a new order
        setCurrentOrderId: (state, action) => {
            state.currentOrderId = action.payload.orderId;
        }

    }
})


export const { setCustomer, removeCustomer, updateTable, setCurrentOrderId } = customerSlice.actions; // Export new action
export default customerSlice.reducer;
