// src/Components/Guide.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaFileAlt,
  FaDownload,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";

const GUIDE_API_URL = "https://mazedakhale.in/api/images";

export default function Guide() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();

  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(GUIDE_API_URL);
        setImages(data);
      } catch (err) {
        console.error("Error fetching guide images:", err);
        setError("Failed to load images");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="ml-[300px] mt-[80px]">Loading guide…</p>;
  if (error)
    return <p className="ml-[300px] mt-[80px] text-red-600">{error}</p>;

  return (
    <div className="ml-[250px] flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <div className="w-[100%] max-w-6xl bg-white shadow-lg rounded-lg">
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Guide
          </h2>
          <button
            onClick={() => {
              setIsAdding(false);
              navigate("/Cdashinner");
            }}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {images.length === 0 ? (
          <p>No images available.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {images.map((img) => (
              <li
                key={img.id}
                className="border rounded overflow-hidden shadow-sm"
              >
                <img
                  src={img.imageUrl}
                  alt={img.description || `Image ${img.id}`}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <p className="font-semibold mb-2">
                    {img.description || "(No description)"}
                  </p>

                  {/* YouTube Link */}
                  {img.youtubeLink && (
                    <>
                      <a
                        href={img.youtubeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Watch on YouTube
                      </a>
                      {/* YouTube Description */}
                      {img.youtubeDescription && (
                        <p className="mt-1 text-sm text-gray-600">
                          {img.youtubeDescription}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
