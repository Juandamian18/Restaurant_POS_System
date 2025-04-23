                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTotalPrice, removeAllItems } from "../../redux/slices/cartSlice"; // Import removeAllItems
import {
  addOrder,
  addItemsToOrder, // Import the new API function
  updateTable,
  // createOrderRazorpay, // Remove unused imports if online payment is deferred
  // verifyPaymentRazorpay,
} from "../../https/index";
import { enqueueSnackbar } from "notistack";
import { useMutation, useQueryClient } from "@tanstack/react-query"; // Import useQueryClient
import { removeCustomer, setCurrentOrderId } from "../../redux/slices/customerSlice";
import Invoice from "../invoice/Invoice";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { closeTable } from "../../https/index"; // Import closeTable API function

function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

const Bill = () => {
  const dispatch = useDispatch();

  const customerData = useSelector((state) => state.customer);
  const cartData = useSelector((state) => state.cart);
  const total = useSelector(getTotalPrice);
  const taxRate = 5.25;
  const tax = (total * taxRate) / 100;
  const totalPriceWithTax = total + tax;

  // Remove paymentMethod state
  // const [paymentMethod, setPaymentMethod] = useState();
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderInfo, setOrderInfo] = useState(); // Still needed for potential invoice display
  const currentOrderId = useSelector((state) => state.customer.currentOrderId); // Get currentOrderId from state

  const handleAddToTable = async () => {
    // Basic validation
    if (!customerData?.table?._id) {
        enqueueSnackbar("No table selected.", { variant: "error" });
        return;
    }
     if (cartData.length === 0) {
         enqueueSnackbar("Cart is empty. Please add items.", { variant: "warning" });
         return;
     }
     // Remove check for customer name/phone - backend will use defaults if empty
     // if (!customerData.customerName || !customerData.customerPhone) {
     //     enqueueSnackbar("Customer details missing.", { variant: "warning" });
     //     return;
     // }


     // Construct order data directly - send current values or let backend use defaults
     const orderData = {
       customerDetails: {
         name: customerData.customerName || undefined, // Send undefined if empty to trigger backend default
         phone: customerData.customerPhone || undefined, // Send undefined if empty to trigger backend default
         guests: customerData.guests || 1,
       },
       orderStatus: "In Progress",
      bills: {
        total: total,
        tax: tax,
        totalWithTax: totalPriceWithTax,
      },
      items: cartData,
      table: customerData.table._id, // Already corrected
      paymentMethod: "Pending", // Set default payment status
      // paymentData can be omitted or set later
    };

    // Decide whether to create a new order or add items to existing one
    if (currentOrderId) {
        // Add items to existing order
        const itemsToAddData = {
            orderId: currentOrderId,
            items: cartData,
            bills: orderData.bills // Send updated bill calculation
        };
        addItemsMutation.mutate(itemsToAddData);
    } else {
        // Create a new order
        createOrderMutation.mutate(orderData);
    }
  };

  // Mutation for creating the *first* order for a table
  const createOrderMutation = useMutation({
    mutationFn: (reqData) => addOrder(reqData),
    onSuccess: (resData) => {
      const newOrder = resData.data.data;
      console.log("New order created:", newOrder);
      setOrderInfo(newOrder); // For potential invoice display

      // Update Redux state with the new currentOrderId
      dispatch(setCurrentOrderId({ orderId: newOrder._id }));

      // Update Table status and link currentOrder (Backend might handle this better via model hooks?)
      // For now, explicitly update table status to 'Occupied'
      const tableUpdateData = {
        tableId: newOrder.table, // Use the table ID from the new order response
        status: "Occupied", // Set status to Occupied
        orderId: newOrder._id // Link the new order ID
      };
      updateTableStatusMutation.mutate(tableUpdateData); // Use a separate mutation if needed, or reuse tableUpdateMutation

      enqueueSnackbar("Order started and items added!", { variant: "success" });
      // Clear the cart after adding
      dispatch(removeAllItems());
      // Don't remove customer/table data here
      // setShowInvoice(true); // Maybe don't show invoice yet
      // Invalidate tables query to update status on Tables page
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
    onError: (error) => {
      console.error("Error creating order:", error);
      enqueueSnackbar(`Error creating order: ${error.response?.data?.message || 'Server error'}`, { variant: "error" });
    },
  });

  // Mutation for adding items to an *existing* order
  const addItemsMutation = useMutation({
      mutationFn: (reqData) => addItemsToOrder(reqData),
      onSuccess: (resData) => {
          const updatedOrder = resData.data.data;
          console.log("Items added to order:", updatedOrder);
          setOrderInfo(updatedOrder); // Update order info for potential invoice

          enqueueSnackbar("Items added to existing order!", { variant: "success" });
          // Clear the cart after adding
          dispatch(removeAllItems());
      // Don't remove customer/table data here
      // setShowInvoice(true); // Maybe don't show invoice yet
       // Invalidate tables query to update status on Tables page
       queryClient.invalidateQueries({ queryKey: ['tables'] });
      },
      onError: (error) => {
          console.error("Error adding items to order:", error);
          enqueueSnackbar(`Error adding items: ${error.response?.data?.message || 'Server error'}`, { variant: "error" });
      }
  });


  // Mutation specifically for updating table status (e.g., to Occupied)
  // Reusing tableUpdateMutation might be okay if its onSuccess doesn't clear customer data
   const updateTableStatusMutation = useMutation({
     mutationFn: (reqData) => updateTable(reqData), // Uses the same API endpoint
     onSuccess: (resData) => {
       console.log("Table status updated:", resData);
       // Do NOT clear customer/cart data here
     },
     onError: (error) => {
       console.error("Error updating table status:", error);
       enqueueSnackbar(`Error updating table: ${error.response?.data?.message || 'Server error'}`, { variant: "error" });
     },
   });

  // Remove the old tableUpdateMutation that cleared customer data
  // const tableUpdateMutation = useMutation({ ... });

  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Get query client instance

  // --- Close Table Logic ---
  const closeTableMutation = useMutation({
      mutationFn: (reqData) => closeTable(reqData), // Use the imported closeTable function
      onSuccess: (resData) => {
          console.log("Table closed successfully:", resData);
          enqueueSnackbar("Table closed and order finalized!", { variant: "success" });
          // Invalidate the tables query cache to force refetch on navigation
          queryClient.invalidateQueries({ queryKey: ['tables'] });
          // Clear local state and navigate away
          dispatch(removeCustomer()); // Clears customer, table, currentOrderId
          dispatch(removeAllItems()); // Clears cart
          navigate("/tables"); // Navigate back to tables list
      },
      onError: (error) => {
          console.error("Error closing table:", error);
          enqueueSnackbar(`Error closing table: ${error.response?.data?.message || 'Server error'}`, { variant: "error" });
      }
  });

  const handleCloseTable = () => {
      if (!currentOrderId) {
          enqueueSnackbar("No active order found for this table.", { variant: "warning" });
          return;
      }
      if (!customerData?.table?._id) {
           enqueueSnackbar("No table selected.", { variant: "error" });
           return;
      }
      // Confirmation dialog might be good here in a real app
      closeTableMutation.mutate({ tableId: customerData.table._id });
  };


  // --- End Close Table Logic ---


  return (
    <>
      <div className="flex items-center justify-between px-5 mt-2"> {/* Moved Bill details inside return */}
        <p className="text-xs text-[#ababab] font-medium mt-2">
          Items({cartData.length}) {/* Corrected typo: length */}
        </p>
        <h1 className="text-[#f5f5f5] text-md font-bold">
          ₹{total.toFixed(2)}
        </h1>
      </div>
      <div className="flex items-center justify-between px-5 mt-2">
        <p className="text-xs text-[#ababab] font-medium mt-2">Tax(5.25%)</p>
        <h1 className="text-[#f5f5f5] text-md font-bold">₹{tax.toFixed(2)}</h1>
      </div>
      <div className="flex items-center justify-between px-5 mt-2">
        <p className="text-xs text-[#ababab] font-medium mt-2">
          Total With Tax
        </p>
        <h1 className="text-[#f5f5f5] text-md font-bold">
          ₹{totalPriceWithTax.toFixed(2)}
        </h1>
      </div>
      {/* Remove Payment Method Buttons */}
      {/* <div className="flex items-center gap-3 px-5 mt-4"> ... </div> */}

      {/* Buttons Section */}
      <div className="flex flex-col gap-3 px-5 mt-4">
        {/* Add to Table Button */}
        <button
          onClick={handleAddToTable}
          className="bg-[#f6b100] px-4 py-3 w-full rounded-lg text-[#1f1f1f] font-semibold text-lg disabled:opacity-60"
          // Update disabled conditions based on the relevant mutations
          disabled={cartData.length === 0 || !customerData?.table?._id || createOrderMutation.isLoading || addItemsMutation.isLoading || updateTableStatusMutation.isLoading}
        >
          {/* Update loading text */}
          {createOrderMutation.isLoading || addItemsMutation.isLoading ? "Adding..." : "Add to the table"}
        </button>

        {/* Close Table Button - Only show if there's an active order */}
        {currentOrderId && (
             <button
                onClick={handleCloseTable}
                className="bg-red-600 hover:bg-red-700 px-4 py-3 w-full rounded-lg text-white font-semibold text-lg disabled:opacity-60"
                disabled={closeTableMutation.isLoading}
             >
                {closeTableMutation.isLoading ? "Closing..." : "Close Table / Finalize"}
             </button>
        )}

         {/* Print Receipt Button - Functionality TBD */}
         <button className="bg-[#025cca] px-4 py-3 w-full rounded-lg text-[#f5f5f5] font-semibold text-lg">
           Print Receipt
         </button>
      </div>


      {showInvoice && (
        <Invoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />
      )}
    </>
  );
};

export default Bill;
