import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Youtube = () => {
  const [images, setImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState({
    image: null,
    description: "",
    youtubeLink: "",
    youtubeDescription: "",
  });

  const navigate = useNavigate();
  const apiUrl = "http://localhost:3000/images";

  // Fetch all images
  const fetchImages = async () => {
    try {
      const { data } = await axios.get(apiUrl);
      setImages(data);
    } catch {
      Swal.fire("Error", "Failed to fetch images", "error");
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // File & text inputs
  const handleFileChange = (e) =>
    setFormData((fd) => ({ ...fd, image: e.target.files[0] }));
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((fd) => ({ ...fd, [name]: value }));
  };

  // Create or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = new FormData();
    if (formData.image) payload.append("image", formData.image);
    payload.append("description", formData.description);
    payload.append("youtubeLink", formData.youtubeLink);
    payload.append("youtubeDescription", formData.youtubeDescription);

    try {
      if (isEditing && editingImage) {
        await axios.put(`${apiUrl}/${editingImage.id}`, payload);
        Swal.fire("Success", "Image updated successfully!", "success");
      } else {
        await axios.post(apiUrl, payload);
        Swal.fire("Success", "Image added successfully!", "success");
      }
      // reset
      setIsModalOpen(false);
      setIsEditing(false);
      setEditingImage(null);
      setFormData({
        image: null,
        description: "",
        youtubeLink: "",
        youtubeDescription: "",
      });
      fetchImages();
    } catch {
      Swal.fire("Error", "Failed to save image", "error");
    }
  };

  // Start editing
  const handleEdit = (img) => {
    setIsEditing(true);
    setEditingImage(img);
    setFormData({
      image: null,
      description: img.description || "",
      youtubeLink: img.youtubeLink || "",
      youtubeDescription: img.youtubeDescription || "",
    });
    setIsModalOpen(true);
  };

  // Delete
  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the image.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
    });
    if (res.isConfirmed) {
      try {
        await axios.delete(`${apiUrl}/${id}`);
        Swal.fire("Deleted!", "Image has been deleted.", "success");
        fetchImages();
      } catch {
        Swal.fire("Error", "Failed to delete image", "error");
      }
    }
  };

  return (
    <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)] overflow-x-hidden">
      <div className="relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden">
        {/* Header */}
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Youtube Links List{" "}
          </h2>
          <button
            onClick={() => {
              setIsAdding(false);
              navigate("/Adashinner");
            }}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Add Button */}
        <div className="p-4 flex justify-end">
          <button
            onClick={() => {
              setIsModalOpen(true);
              setIsEditing(false);
              setEditingImage(null);
            }}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 flex items-center gap-2"
          >
            <FaPlus /> Add Image
          </button>
        </div>

        {/* TABLE */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full table-auto text-sm bg-white">
            <thead className="bg-[#F58A3B14]">
              <tr>
                {[
                  "ID",
                  "Preview",
                  "URL",
                  "Description",
                  "YouTube Link",
                  "YouTube Desc",
                  "Created At",
                  "Actions",
                ].map((hdr) => (
                  <th
                    key={hdr}
                    className="px-4 py-2 text-center font-semibold border border-gray-300"
                  >
                    {hdr}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {images.length > 0 ? (
                images.map((img, i) => (
                  <tr
                    key={img.id}
                    className={`${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100`}
                  >
                    <td className="px-4 py-2 text-center border">{img.id}</td>
                    <td className="px-4 py-2 text-center border">
                      <img
                        src={img.imageUrl}
                        alt="preview"
                        className="max-w-[100px] max-h-[100px] mx-auto"
                      />
                    </td>
                    <td className="px-4 py-2 text-center border">
                      <a
                        href={img.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    </td>
                    <td className="px-4 py-2 text-center border">
                      {img.description || "-"}
                    </td>
                    <td className="px-4 py-2 text-center border">
                      {img.youtubeLink ? (
                        <a
                          href={img.youtubeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Link
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-2 text-center border">
                      {img.youtubeDescription || "-"}
                    </td>
                    <td className="px-4 py-2 text-center border">
                      {new Date(img.createdAt).toLocaleString("en-GB")}
                    </td>
                    <td className="px-4 py-2 text-center border flex justify-center gap-4">
                      <button
                        onClick={() => handleEdit(img)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(img.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="py-4 text-center text-gray-500 border"
                  >
                    No images found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-[400px]">
            {/* Modal Close */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
            >
              <FaTimes size={18} />
            </button>
            <h2 className="text-xl font-bold mb-4 text-center">
              {isEditing ? "Edit Image" : "Add Image"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="file"
                name="image"
                onChange={handleFileChange}
                className="p-2 border rounded"
              />
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Description"
                className="p-2 border rounded"
              />
              <input
                type="text"
                name="youtubeLink"
                value={formData.youtubeLink}
                onChange={handleInputChange}
                placeholder="YouTube Link"
                className="p-2 border rounded"
              />
              <input
                type="text"
                name="youtubeDescription"
                value={formData.youtubeDescription}
                onChange={handleInputChange}
                placeholder="YouTube Description"
                className="p-2 border rounded"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
                >
                  {isEditing ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Youtube;
