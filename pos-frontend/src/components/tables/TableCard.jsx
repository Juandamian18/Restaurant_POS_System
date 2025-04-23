import React from "react";
import { useNavigate } from "react-router-dom";
import { getAvatarName, getBgColor } from "../../utils"
import { useDispatch } from "react-redux";
import { updateTable } from "../../redux/slices/customerSlice";
import { FaLongArrowAltRight } from "react-icons/fa";

// Receive the whole table object as a prop
const TableCard = ({ table }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Destructure needed properties from the table object
  const { _id, tableNo, status, seats, currentOrder } = table;
  const initials = currentOrder?.customerDetails?.name; // Get initials if currentOrder exists

  const handleClick = () => {
    // Allow clicking on any table to view/add to its order
    // if (status === "Booked" || status === "Occupied") return; // Remove this check

    // Dispatch the entire table object received from props
    // This will set the table and currentOrderId (if exists) in Redux
    dispatch(updateTable({ table: table }));
    navigate(`/menu`);
  };

  return (
    // Use _id for the key
    <div onClick={handleClick} key={_id} className="w-[300px] hover:bg-[#2c2c2c] bg-[#262626] p-4 rounded-lg cursor-pointer">
      <div className="flex items-center justify-between px-1">
        {/* Use tableNo from the destructured table object */}
        <h1 className="text-[#f5f5f5] text-xl font-semibold">Table <FaLongArrowAltRight className="text-[#ababab] ml-2 inline" /> {tableNo}</h1>
        {/* Use status from the destructured table object */}
        <p className={`${status === "Booked" || status === "Occupied" ? "text-green-600 bg-[#2e4a40]" : "bg-[#664a04] text-white"} px-2 py-1 rounded-lg`}>
          {status}
        </p>
      </div>
      <div className="flex items-center justify-center mt-5 mb-8">
         {/* Use initials derived from currentOrder */}
        <h1 className={`text-white rounded-full p-5 text-xl`} style={{backgroundColor : initials ? getBgColor() : "#1f1f1f"}} >{getAvatarName(initials) || "N/A"}</h1>
      </div>
       {/* Use seats from the destructured table object */}
      <p className="text-[#ababab] text-xs">Seats: <span className="text-[#f5f5f5]">{seats}</span></p>
    </div>
  );
};

export default TableCard;
