import { axiosWrapper } from "./axiosWrapper";

// API Endpoints

// Auth Endpoints
export const login = (data) => axiosWrapper.post("/api/user/login", data);
export const register = (data) => axiosWrapper.post("/api/user/register", data);
export const getUserData = () => axiosWrapper.get("/api/user");
export const logout = () => axiosWrapper.post("/api/user/logout");

// Table Endpoints
export const addTable = (data) => axiosWrapper.post("/api/table/", data);
export const getTables = () => axiosWrapper.get("/api/table");
export const updateTable = ({ tableId, ...tableData }) => // Updates status, links order
  axiosWrapper.put(`/api/table/${tableId}`, tableData);
export const closeTable = ({ tableId }) => // New function to finalize order and free table
    axiosWrapper.patch(`/api/table/${tableId}/close`); // Using PATCH for this action

// Payment Endpoints
export const createOrderRazorpay = (data) =>
  axiosWrapper.post("/api/payment/create-order", data);
export const verifyPaymentRazorpay = (data) =>
  axiosWrapper.post("/api/payment//verify-payment", data);

// Order Endpoints
// Ensure 'orderData' includes customerDetails, bills, items, table (ID), paymentMethod etc.
export const addOrder = (orderData) => axiosWrapper.post("/api/order/", orderData); // Creates a new order
export const getOrders = () => axiosWrapper.get("/api/order");
export const updateOrderStatus = ({ orderId, orderStatus }) =>
  axiosWrapper.put(`/api/order/${orderId}`, { orderStatus });
// Adds items to an existing order and updates bills
export const addItemsToOrder = ({ orderId, items, bills }) =>
    axiosWrapper.patch(`/api/order/${orderId}/items`, { items, bills });
// Fetches a single order by ID
export const getOrderById = (orderId) => axiosWrapper.get(`/api/order/${orderId}`);

// Category Endpoints
export const addCategory = (data) => axiosWrapper.post("/api/category", data);
export const getCategories = () => axiosWrapper.get("/api/category");

// Dish Endpoints
// Modify addDish to handle FormData for file uploads
export const addDish = (formData) => axiosWrapper.post("/api/dish", formData, {
  headers: {
    'Content-Type': 'multipart/form-data', // Important for file uploads
  },
});
export const getDishes = (categoryId = null) => {
  const url = categoryId ? `/api/dish?category=${categoryId}` : "/api/dish";
  return axiosWrapper.get(url);
};
