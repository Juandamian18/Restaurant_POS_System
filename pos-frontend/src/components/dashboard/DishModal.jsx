import React, { useState, useEffect } from 'react';
import { addDish, getCategories } from '../../https/index';
import toast from 'react-hot-toast';
import { FaTimes } from 'react-icons/fa';

const DishModal = ({ setIsDishModalOpen }) => {
  const [dishData, setDishData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '', // This will be handled by file upload now
  });
  const [imageFile, setImageFile] = useState(null); // State for the image file
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch categories when modal opens
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await getCategories();
        setCategories(response.data);
        // Set default category if available
        if (response.data.length > 0) {
          setDishData(prev => ({ ...prev, category: response.data[0]._id }));
        }
      } catch (error) {
        console.error("Error fetching categories for dish modal:", error);
        toast.error("Failed to load categories.");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDishData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        setImageFile(file);
    } else {
        setImageFile(null);
        toast.error('Please select a valid image file (jpg, png, gif, webp).');
        e.target.value = null; // Reset file input
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dishData.name || !dishData.price || !dishData.category) {
      toast.error('Dish name, price, and category are required.');
      return;
    }
     if (isNaN(dishData.price) || Number(dishData.price) < 0) {
        toast.error('Price must be a valid non-negative number.');
        return;
    }

    setIsLoading(true);

    // Create FormData
    const formData = new FormData();
    formData.append('name', dishData.name);
    formData.append('description', dishData.description);
    formData.append('price', Number(dishData.price)); // Ensure price is a number
    formData.append('category', dishData.category);
    if (imageFile) {
      formData.append('image', imageFile); // Append the file with key 'image'
    }
    // No need to append imageUrl, backend handles it from the file

    try {
      const response = await addDish(formData); // Send FormData
      toast.success(`Dish "${response.data.name}" added successfully!`);
      // Reset form and file input
      setDishData({ name: '', description: '', price: '', category: categories.length > 0 ? categories[0]._id : '', imageUrl: '' });
      setImageFile(null);
      // Reset file input visually (find a better way if needed)
      const fileInput = document.getElementById('image');
      if (fileInput) fileInput.value = null;

      setIsDishModalOpen(false); // Close modal
    } catch (error) {
      console.error('Error adding dish:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add dish.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-[#1f1f1f] p-8 rounded-lg shadow-xl w-full max-w-lg relative">
        <button
          onClick={() => setIsDishModalOpen(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
          aria-label="Close modal"
        >
          <FaTimes size={20} />
        </button>
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Add New Dish</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Dropdown */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={dishData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#2a2a2a] text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
              required
              disabled={loadingCategories || isLoading || categories.length === 0}
            >
              {loadingCategories ? (
                <option>Loading categories...</option>
              ) : categories.length === 0 ? (
                 <option value="">No categories available</option>
              ) : (
                categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))
              )}
            </select>
             {categories.length === 0 && !loadingCategories && (
                 <p className="text-xs text-red-400 mt-1">Please add a category first.</p>
             )}
          </div>

          {/* Dish Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Dish Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={dishData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#2a2a2a] text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="e.g., Butter Chicken"
              required
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={dishData.description}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-2 bg-[#2a2a2a] text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="e.g., Creamy tomato-based curry with tender chicken"
              disabled={isLoading}
            ></textarea>
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">
              Price (₹)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={dishData.price}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#2a2a2a] text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="e.g., 350"
              required
              min="0"
              step="0.01" // Allow decimal prices if needed
              disabled={isLoading}
            />
          </div>

           {/* Image File Input */}
           <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-1">
              Dish Image (Optional)
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/png, image/jpeg, image/jpg, image/gif, image/webp" // Specify accepted types
              onChange={handleFileChange}
              className="w-full px-3 py-2 bg-[#2a2a2a] text-white border border-gray-600 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 disabled:opacity-50"
              disabled={isLoading}
            />
            {imageFile && (
                <p className="text-xs text-gray-400 mt-1">Selected: {imageFile.name}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-4 rounded-lg transition duration-200 ease-in-out disabled:opacity-50 mt-2"
            disabled={isLoading || loadingCategories || categories.length === 0}
          >
            {isLoading ? 'Adding Dish...' : 'Add Dish'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DishModal;
