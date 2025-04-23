import React, { useState } from 'react';
import { addCategory } from '../../https/index';
import toast from 'react-hot-toast';
import { FaTimes } from 'react-icons/fa'; // Icon for close button

const CategoryModal = ({ setIsCategoryModalOpen }) => {
  const [categoryName, setCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error('Category name cannot be empty.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await addCategory({ name: categoryName });
      toast.success(`Category "${response.data.name}" added successfully!`);
      setCategoryName(''); // Clear input
      setIsCategoryModalOpen(false); // Close modal on success
      // Optionally, trigger a refresh of categories list if displayed on Dashboard
    } catch (error) {
      console.error('Error adding category:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add category.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-[#1f1f1f] p-8 rounded-lg shadow-xl w-full max-w-md relative">
        <button
          onClick={() => setIsCategoryModalOpen(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
          aria-label="Close modal"
        >
          <FaTimes size={20} />
        </button>
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Add New Category</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="categoryName" className="block text-sm font-medium text-gray-300 mb-1">
              Category Name
            </label>
            <input
              type="text"
              id="categoryName"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-4 py-2 bg-[#2a2a2a] text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="e.g., Appetizers, Main Course"
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg transition duration-200 ease-in-out disabled:opacity-50"
            disabled={isLoading || !categoryName.trim()}
          >
            {isLoading ? 'Adding...' : 'Add Category'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
