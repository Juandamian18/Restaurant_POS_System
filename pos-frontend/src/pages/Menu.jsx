import React, { useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import { MdRestaurantMenu } from "react-icons/md";
import MenuContainer from "../components/menu/MenuContainer";
import CustomerInfo from "../components/menu/CustomerInfo";
import CartInfo from "../components/menu/CartInfo";
import Bill from "../components/menu/Bill";
import { useSelector, useDispatch } from "react-redux";
import { getOrderById } from "../https/index";
import { loadCartFromOrder, removeAllItems } from "../redux/slices/cartSlice"; // Import removeAllItems here
import { setCustomer } from "../redux/slices/customerSlice";
import toast from "react-hot-toast";

const Menu = () => {
  const dispatch = useDispatch();
  const customerData = useSelector((state) => state.customer);
  const currentOrderId = useSelector((state) => state.customer.currentOrderId);

  useEffect(() => {
    document.title = "POS | Menu";
  }, []);

  // Effect to load existing order details if currentOrderId exists
  useEffect(() => {
    const fetchAndLoadOrder = async (orderId) => {
      try {
        console.log(`Fetching order details for ID: ${orderId}`);
        const response = await getOrderById(orderId);
        const order = response.data.data; // Assuming API returns { success: true, data: order }
        console.log("Fetched order:", order);

        if (order && order.items) {
          // Load items into the cart
          dispatch(loadCartFromOrder(order.items));
          console.log("Cart loaded from order items:", order.items);

          // Optionally update customer details from the order
          // This ensures consistency if details were entered previously for this order
          if (order.customerDetails) {
             dispatch(setCustomer({
                 name: order.customerDetails.name,
                 phone: order.customerDetails.phone,
                 guests: order.customerDetails.guests
             }));
             console.log("Customer details updated from order:", order.customerDetails);
          }

        } else {
             console.warn("Fetched order data is missing items array:", order);
             // Clear cart if order has no items? Or handle as needed.
             // dispatch(removeAllItems());
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
        toast.error(`Failed to load existing order details: ${error.response?.data?.message || 'Server error'}`);
        // Decide how to handle error - maybe clear cart/customer?
        // dispatch(removeAllItems());
        // dispatch(removeCustomer()); // This might be too drastic
      }
    };

    if (currentOrderId) {
      // Existing order found, fetch its details
      fetchAndLoadOrder(currentOrderId);
    } else {
      // No current order ID means it's a new order for this table, clear any lingering cart items
      console.log("No currentOrderId found, clearing cart for new table.");
      dispatch(removeAllItems());
    }
    // Dependency array includes currentOrderId to refetch if it changes
  }, [currentOrderId, dispatch]);


  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex gap-3">
      {/* Left Div */}
      <div className="flex-[3]">
        <div className="flex items-center justify-between px-10 py-4">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
              Menu
            </h1>
          </div>
          <div className="flex items-center justify-around gap-4">
            <div className="flex items-center gap-3 cursor-pointer">
              <MdRestaurantMenu className="text-[#f5f5f5] text-4xl" />
              <div className="flex flex-col items-start">
                <h1 className="text-md text-[#f5f5f5] font-semibold tracking-wide">
                  {customerData.customerName || "Customer Name"}
                </h1>
                <p className="text-xs text-[#ababab] font-medium">
                  Table : {customerData.table?.tableNo || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <MenuContainer />
      </div>
      {/* Right Div */}
      <div className="flex-[1] bg-[#1a1a1a] mt-4 mr-3 h-[780px] rounded-lg pt-2">
        {/* Customer Info */}
        <CustomerInfo />
        <hr className="border-[#2a2a2a] border-t-2" />
        {/* Cart Items */}
        <CartInfo />
        <hr className="border-[#2a2a2a] border-t-2" />
        {/* Bills */}
        <Bill />
      </div>

      <BottomNav />
    </section>
  );
};

export default Menu;
