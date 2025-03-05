import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaFileAlt } from "react-icons/fa";

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const API_BASE_URL = "https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/categories";
  const SUBCATEGORIES_API_URL = "https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/subcategories";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(API_BASE_URL);
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const fetchSubcategories = async (categoryId, categoryName) => {
    try {
      const response = await axios.get(SUBCATEGORIES_API_URL);
      const filteredSubcategories = response.data.filter(
        (sub) => sub.category.category_id === categoryId
      );
      setSubcategories(filteredSubcategories);
      setSelectedCategory({ categoryId, categoryName });
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const handleSubcategorySelect = (subcategoryId, subcategoryName, categoryId, categoryName) => {
    navigate("/Apply", {
      state: { categoryId, categoryName, subcategoryId, subcategoryName },
    });
  };

  return (
    <div className="flex">
      {/* Sidebar Placeholder to Avoid Overlapping */}
      <div className="w-[340px] hidden md:block"></div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 text-[#1e293b] min-h-screen animate-fadeIn p-6 pt-12">
        <section className="relative bg-orange-300 text-black py-16 px-6 text-center shadow-md">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold -mt-9 mb-1">Government Document Services</h1>
            <p className="text-lg -mb-10 text-gray-900">
              Apply for various government documents quickly and hassle-free. Select a category below to proceed with your application.
            </p>
          </div>
        </section>

        {/* Title or Back Button */}
        <div className="max-w-7xl mx-auto mt-6 flex justify-center">
          <h2 className="text-2xl font-bold mb-5 text-gray-900">
            {!selectedCategory ? "Select Categories" : "Select Sub Categories"}
          </h2>
        </div>


        {/* Categories & Subcategories Grid */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-7xl mx-auto mt-4">
          {!selectedCategory ? (
            categories.map((category) => (
              <div
                key={category.category_id}
                className="flex items-center w-full p-4 rounded-lg shadow-xl cursor-pointer transition-all duration-300 bg-gray-100 hover:bg-orange-200"
                onClick={() => fetchSubcategories(category.category_id, category.category_name)}
              >
                <FaFileAlt className="text-2xl text-orange-500" />
                <span className="ml-4 text-lg font-medium">{category.category_name}</span>
              </div>

            ))
          ) : (
            subcategories.length > 0 ? (
              subcategories.map((sub) => (
                <div
                  key={sub.subcategory_id}
                  className="flex items-center w-full p-4 rounded-lg shadow-xl cursor-pointer transition-all duration-300 bg-orange-200 hover:bg-white"
                  onClick={() => handleSubcategorySelect(sub.subcategory_id, sub.subcategory_name, selectedCategory.categoryId, selectedCategory.categoryName)}
                >
                  <FaFileAlt className="text-2xl text-[#00234E]" />
                  <span className="ml-4 text-lg font-medium">{sub.subcategory_name}</span>
                </div>

              ))
            ) : (
              <p className="text-lg text-gray-600 text-center w-full">No subcategories found.</p>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
