import React, { useState, useEffect } from "react";
// import { menus } from "../../constants"; // Remove hardcoded data
import { GrRadialSelected } from "react-icons/gr";
import { FaShoppingCart, FaPlus } from "react-icons/fa"; // Add FaPlus
import { useDispatch } from "react-redux";
import { addItems } from "../../redux/slices/cartSlice";
import { getCategories, addCategory, getDishes } from "../../https/index";
import { axiosWrapper } from "../../https/axiosWrapper"; // Import axiosWrapper to access baseURL
import toast from "react-hot-toast";


const MenuContainer = () => {
  // const [selected, setSelected] = useState(menus[0]); // Will be updated based on fetched data
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); // Use null initially
  const [itemCount, setItemCount] = useState(0); // Tracks quantity for a specific item before adding to cart
  const [currentItemIdForCount, setCurrentItemIdForCount] = useState(null); // Tracks which item's count is being adjusted
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [addingCategory, setAddingCategory] = useState(false);
  const [dishes, setDishes] = useState([]); // State for dishes of selected category
  const [loadingDishes, setLoadingDishes] = useState(false); // State for loading dishes
  const dispatch = useDispatch();

  // Fetch categories initially
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch dishes when selectedCategory changes
  useEffect(() => {
    if (selectedCategory?._id) {
      fetchDishes(selectedCategory._id);
    } else {
      setDishes([]); // Clear dishes if no category is selected
    }
     // Reset item count when category changes
     setCurrentItemIdForCount(null);
     setItemCount(0);
  }, [selectedCategory]);


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

   const fetchDishes = async (categoryId) => {
    setLoadingDishes(true);
    setDishes([]); // Clear previous dishes
    try {
      const response = await getDishes(categoryId);
      // Ensure response.data is an array before setting
      setDishes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      // Log the detailed error
      console.error(`Error fetching dishes for category ${categoryId}:`, error.response?.data || error.message || error);
      toast.error(`Failed to load dishes: ${error.response?.data?.message || 'Server error'}`);
      setDishes([]); // Ensure dishes is empty on error
    } finally {
      setLoadingDishes(false);
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


  // --- Item Count Logic ---
  // Ensure count is specific to the item being interacted with
  const increment = (dishId) => {
    if (currentItemIdForCount !== dishId) {
      // If starting count for a new item, reset to 1
      setCurrentItemIdForCount(dishId);
      setItemCount(1);
    } else {
      // Otherwise, increment existing count
       if (itemCount >= 10) return; // Max quantity limit (e.g., 10)
       setItemCount((prev) => prev + 1);
    }
  };

  const decrement = (dishId) => {
     if (currentItemIdForCount !== dishId) {
       // Cannot decrement if not the current item or count is 0
       return;
     }
     if (itemCount <= 0) return;
     setItemCount((prev) => prev - 1);
     // Optional: If count reaches 0, reset currentItemIdForCount?
     // if (itemCount - 1 === 0) setCurrentItemIdForCount(null);
  };

  const handleAddToCart = (dish) => {
    // Ensure the count is for the correct item and is greater than 0
    if (currentItemIdForCount !== dish._id || itemCount === 0) {
        toast.error("Please set quantity first.");
        return;
    }

    const { name, price } = dish;
    // Use dish._id for uniqueness if needed, or generate new Date() for cart item ID
    const cartItem = {
        id: new Date().toISOString(), // Unique ID for the cart item instance
        dishId: dish._id, // Reference to the original dish
        name,
        pricePerQuantity: price,
        quantity: itemCount,
        price: price * itemCount // Total price for this cart item
    };

    dispatch(addItems(cartItem));
    toast.success(`${itemCount} x ${name} added to cart!`);

    // Reset count for the added item
    setCurrentItemIdForCount(null);
    setItemCount(0);
  }
  // --- End Item Count Logic ---


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
                  // Fetching dishes is handled by the useEffect hook watching selectedCategory
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
                  {/* TODO: Fetch item count per category later if needed */}
                  {/* {category.itemCount || 0} Items */}
                   Dishes
                </p>
              </div>
            );
          })
        )}
      </div>

      <hr className="border-[#2a2a2a] border-t-2 mt-4" />

      {/* Dish List */}
      <div className="grid grid-cols-4 gap-4 px-10 py-4 w-[100%] h-[calc(100vh-20rem)] overflow-y-auto pb-20"> {/* Added height and scroll */}
        {!selectedCategory ? (
          <p className="text-white col-span-4 text-center">Select a category to view dishes.</p>
        ) : loadingDishes ? (
          <p className="text-white col-span-4 text-center">Loading dishes...</p>
        ) : dishes.length === 0 ? (
          <p className="text-white col-span-4 text-center">No dishes found in "{selectedCategory.name}".</p>
        ) : (
          dishes.map((dish) => {
            // Defensive check: Ensure dish object and necessary properties exist
            if (!dish || !dish._id || !dish.name || typeof dish.price === 'undefined') {
                console.warn('Skipping rendering of invalid dish object:', dish);
                return null; // Skip rendering this item if data is invalid
            }

            // Construct image URL more robustly
            const backendBaseUrl = axiosWrapper.defaults.baseURL || ''; // Get base URL or default to empty string
            const imageUrl = dish.imageUrl && backendBaseUrl
              ? `${backendBaseUrl}${dish.imageUrl.startsWith('/') ? dish.imageUrl : '/' + dish.imageUrl}` // Ensure leading slash
              : null;

            const displayCount = currentItemIdForCount === dish._id ? itemCount : 0;

            return (
              <div
                key={dish._id}
                className="flex flex-col items-start justify-between p-4 rounded-lg h-[200px] bg-[#1a1a1a] relative" // Increased height for image
              >
                {/* Optional Image Display */}
                {imageUrl && (
                    <img
                        src={imageUrl}
                        alt={dish.name}
                        className="absolute top-0 left-0 w-full h-1/2 object-cover rounded-t-lg opacity-40" // Basic image styling
                    />
                )}
                 <div className="relative z-10 w-full h-full flex flex-col justify-between"> {/* Content container */}
                    <div className="flex items-start justify-between w-full">
                        <h1 className="text-[#f5f5f5] text-lg font-semibold">{dish.name}</h1>
                        <button
                            onClick={() => handleAddToCart(dish)}
                            className={`p-2 rounded-lg ${displayCount > 0 ? 'bg-[#2e4a40] text-[#02ca3a]' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
                            disabled={displayCount === 0}
                            aria-label="Add to cart"
                        >
                            <FaShoppingCart size={20} />
                        </button>
                    </div>
                    {/* Optional Description */}
                    {/* <p className="text-xs text-gray-400">{dish.description}</p> */}
                    <div className="flex items-center justify-between w-full mt-auto"> {/* Price and Quantity */}
                        <p className="text-[#f5f5f5] text-xl font-bold">₹{dish.price}</p>
                        <div className="flex items-center justify-between bg-[#1f1f1f] px-4 py-2 rounded-lg gap-4 w-[45%]">
                        <button
                            onClick={() => decrement(dish._id)}
                            className="text-yellow-500 text-2xl disabled:text-gray-500"
                            disabled={displayCount === 0}
                            aria-label="Decrease quantity"
                        >
                            &minus;
                        </button>
                        <span className="text-white text-lg font-semibold w-4 text-center">
                            {displayCount}
                        </span>
                        <button
                            onClick={() => increment(dish._id)}
                            className="text-yellow-500 text-2xl"
                            aria-label="Increase quantity"
                        >
                            &#43;
                        </button>
                        </div>
                    </div>
                 </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default MenuContainer;
