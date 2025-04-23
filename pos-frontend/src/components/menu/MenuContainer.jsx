import React, { useState, useEffect } from "react";
// import { menus } from "../../constants"; // Remove hardcoded data
import { GrRadialSelected } from "react-icons/gr";
import { FaShoppingCart, FaPlus } from "react-icons/fa"; // Add FaPlus
import { useDispatch } from "react-redux";
import { addItems } from "../../redux/slices/cartSlice";
import { getCategories, addCategory } from "../../https/index"; // Import API functions
import toast from "react-hot-toast"; // For displaying notifications


const MenuContainer = () => {
  // const [selected, setSelected] = useState(menus[0]); // Will be updated based on fetched data
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); // Use null initially
  const [itemCount, setItemCount] = useState(0);
  const [itemId, setItemId] = useState();
  const [newCategoryName, setNewCategoryName] = useState(""); // State for new category input
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [addingCategory, setAddingCategory] = useState(false);
  const dispatch = useDispatch();

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await getCategories();
      setCategories(response.data);
      if (response.data.length > 0) {
        // Select the first category by default, assuming items are associated with categories
        // This part needs adjustment based on how items are fetched/structured
        setSelectedCategory(response.data[0]);
      } else {
        setSelectedCategory(null); // No categories available
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories.");
    } finally {
      setLoadingCategories(false);
    }
  };

  // Handle adding a new category
  const handleAddCategory = async (e) => {
    e.preventDefault(); // Prevent form submission if wrapped in a form
    if (!newCategoryName.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }
    setAddingCategory(true);
    try {
      const response = await addCategory({ name: newCategoryName });
      toast.success(`Category "${response.data.name}" added successfully!`);
      setNewCategoryName(""); // Clear input
      fetchCategories(); // Refresh the category list
    } catch (error) {
      console.error("Error adding category:", error);
      const errorMessage = error.response?.data?.message || "Failed to add category.";
      toast.error(errorMessage);
    } finally {
      setAddingCategory(false);
    }
  };


  const increment = (id) => {
    setItemId(id);
    if (itemCount >= 4) return;
    setItemCount((prev) => prev + 1);
  };

  const decrement = (id) => {
    setItemId(id);
    if (itemCount <= 0) return;
    setItemCount((prev) => prev - 1);
  };

  const handleAddToCart = (item) => {
    if(itemCount === 0) return;

    const {name, price} = item;
    const newObj = { id: new Date(), name, pricePerQuantity: price, quantity: itemCount, price: price * itemCount };

    dispatch(addItems(newObj));
    setItemCount(0);
  }


  // TODO: Implement logic to fetch and display items based on selectedCategory

  return (
    <>
      {/* Add Category Input and Button */}
      <div className="px-10 py-4 flex items-center gap-4">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New Category Name"
            className="bg-[#2a2a2a] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 flex-grow"
            disabled={addingCategory}
          />
          <button
            onClick={handleAddCategory}
            className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
            disabled={addingCategory || !newCategoryName.trim()}
          >
            <FaPlus /> {addingCategory ? "Adding..." : "Add Category"}
          </button>
      </div>

      {/* Category List */}
      <div className="grid grid-cols-4 gap-4 px-10 py-4 w-[100%]">
        {loadingCategories ? (
           <p className="text-white col-span-4 text-center">Loading categories...</p>
        ) : categories.length === 0 ? (
           <p className="text-white col-span-4 text-center">No categories found. Add one above!</p>
        ) : (
          categories.map((category) => {
            // Define a simple color logic or use default
            const bgColor = category.name.length % 2 === 0 ? '#3a3a3a' : '#4a4a4a'; // Example color logic
            return (
              <div
                key={category._id} // Use _id from MongoDB
                className="flex flex-col items-start justify-between p-4 rounded-lg h-[100px] cursor-pointer"
                style={{ backgroundColor: bgColor }} // Use dynamic or default color
                onClick={() => {
                  setSelectedCategory(category);
                  // Reset item selection when category changes
                  setItemId(0);
                  setItemCount(0);
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <h1 className="text-[#f5f5f5] text-lg font-semibold">
                    {/* Add an icon if available or just name */} {category.name}
                  </h1>
                  {selectedCategory?._id === category._id && (
                    <GrRadialSelected className="text-white" size={20} />
                  )}
                </div>
                <p className="text-[#ababab] text-sm font-semibold">
                  {/* Replace with actual item count if available */} 0 Items
                </p>
              </div>
            );
          })
        )}
      </div>

      <hr className="border-[#2a2a2a] border-t-2 mt-4" />

      {/* Item List - Needs to be updated to fetch items for selectedCategory */}
      <div className="grid grid-cols-4 gap-4 px-10 py-4 w-[100%]">
        {/* Placeholder for items - Replace with dynamic item fetching and rendering */}
        {!selectedCategory ? (
           <p className="text-white col-span-4 text-center">Select a category to view items.</p>
        ) : (
          <p className="text-white col-span-4 text-center">Item display logic for "{selectedCategory.name}" needs implementation.</p>
          // Example: selectedCategory?.items.map((item) => { ... })
          // This requires fetching items associated with the selected category
        )}
        {/* Original item mapping logic (commented out for reference) */}
        {/* {selected?.items.map((item) => {
          return (
            <div
              key={item.id}
              className="flex flex-col items-start justify-between p-4 rounded-lg h-[150px] cursor-pointer hover:bg-[#2a2a2a] bg-[#1a1a1a]"
            >
              <div className="flex items-start justify-between w-full">
                <h1 className="text-[#f5f5f5] text-lg font-semibold">
                  {item.name}
                </h1>
                <button onClick={() => handleAddToCart(item)} className="bg-[#2e4a40] text-[#02ca3a] p-2 rounded-lg"><FaShoppingCart size={20} /></button>
              </div>
              <div className="flex items-center justify-between w-full">
                <p className="text-[#f5f5f5] text-xl font-bold">
                  ₹{item.price}
                </p>
                <div className="flex items-center justify-between bg-[#1f1f1f] px-4 py-3 rounded-lg gap-6 w-[50%]">
                  <button
                    onClick={() => decrement(item.id)}
                    className="text-yellow-500 text-2xl"
                  >
                    &minus;
                  </button>
                  <span className="text-white">
                    {itemId == item.id ? itemCount : "0"}
                  </span>
                  <button
                    onClick={() => increment(item.id)}
                    className="text-yellow-500 text-2xl"
                  >
                    &#43;
                  </button>
                </div>
              </div>
            </div>
          );
        })} */}
      </div>
    </>
  );
};

export default MenuContainer;
