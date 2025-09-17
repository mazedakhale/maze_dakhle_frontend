import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaFilePdf, FaFileAlt, FaTimes } from "react-icons/fa";

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const API_BASE_URL = "http://localhost:3000/categories";
  const SUBCATEGORIES_API_URL = "http://localhost:3000/subcategories";

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

  const handleSubcategorySelect = (
    subcategoryId,
    subcategoryName,
    categoryId,
    categoryName
  ) => {
    navigate("/Apply", {
      state: { categoryId, categoryName, subcategoryId, subcategoryName },
    });
  };

  //import { FaFileAlt, FaFilePdf } from "react-icons/fa"; // Import PDF icon
  return (
    <div className="flex">
      {/* Sidebar Placeholder to Avoid Overlapping */}
      <div className="w-[340px] hidden md:block"></div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 text-[#1e293b] min-h-screen animate-fadeIn p-6 pt-12">
        <section className="relative bg-[#F58A3B] text-black py-16 px-6 text-center shadow-[0px_2px_4px_rgba(0,0,0,0.4)]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 text-center">
              Apply for Government Document
            </h2>
            <button
              onClick={() => {
                setIsAdding(false);
                navigate("/Cdashinner");
              }}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
            >
              <FaTimes size={20} />
            </button>{" "}
            <p className="text-lg -mb-10 text-black">
              Apply for various government documents quickly and hassle-free.
              Select a category below to proceed with your application.
            </p>
          </div>
        </section>

        {/* Title or Back Button */}
        <div className="max-w-7xl mx-auto mt-6 flex justify-center">
          <h2 className="text-2xl font-bold mb-5 text-gray-900">
            {!selectedCategory ? "Select Categories" : "Select Sub Categories"}
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full max-w-7xl mx-auto mt-4">
          {/* ✅ Categories Section */}
          {!selectedCategory ? (
            categories.map((category) => (
              <div
                key={category.category_id}
                className="flex w-full rounded-lg shadow-[0px_2px_4px_rgba(0,0,0,0.4)] cursor-pointer transition-all duration-300 overflow-hidden"
                onClick={() =>
                  fetchSubcategories(
                    category.category_id,
                    category.category_name
                  )
                }
              >
                {/* ✅ PDF/Icon Section with Separate BG */}
                <div className="bg-[#FDEDD3] p-3 flex items-center justify-center">
                  {category.isPdf ? (
                    <FaFilePdf className="text-2xl text-orange-500" />
                  ) : (
                    <FaFileAlt className="text-2xl text-orange-500" />
                  )}
                </div>

                {/* ✅ Category Name Section */}
                <div className="flex-1 bg-gray-100 hover:bg-orange-200 p-4">
                  <span className="text-lg font-medium">
                    {category.category_name}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <>
              {/* ✅ Subcategories Section */}
              {subcategories.length > 0 ? (
                subcategories.map((sub) => (
                  <div
                    key={sub.subcategory_id}
                    className="flex w-full rounded-lg shadow-[0px_2px_4px_rgba(0,0,0,0.4)] cursor-pointer transition-all duration-300 overflow-hidden"
                    onClick={() =>
                      handleSubcategorySelect(
                        sub.subcategory_id,
                        sub.subcategory_name,
                        selectedCategory.categoryId,
                        selectedCategory.categoryName
                      )
                    }
                  >
                    {/* ✅ PDF/Icon Section with Separate BG */}
                    <div className="bg-[#FDEDD3] p-3 flex items-center justify-center">
                      {sub.isPdf ? (
                        <FaFilePdf className="text-2xl text-orange-500" />
                      ) : (
                        <FaFileAlt className="text-2xl text-orange-500" />
                      )}
                    </div>

                    {/* ✅ Subcategory Name Section */}
                    <div className="flex-1 bg-gray-100 hover:bg-orange-200 p-4">
                      <span className="text-lg font-medium">
                        {sub.subcategory_name}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-lg text-gray-600 text-center w-full">
                  No subcategories found.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
