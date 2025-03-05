import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaFileAlt, FaFileInvoice } from "react-icons/fa";
import jwtDecode from "jwt-decode";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const VerifyDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [distributorId, setDistributorId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const userId =
          decodedToken.user_id || decodedToken.id || decodedToken.user;
        if (userId) {
          setDistributorId(userId);
          fetchDocuments(userId);
        } else {
          console.error("User ID is missing in the decoded token.");
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else {
      console.error("Token is missing.");
    }
  }, []);

  const fetchDocuments = async (distributorId) => {
    try {
      const response = await axios.get(
        `https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/documents/list/${distributorId}`
      );

      const filteredDocuments = response.data.documents.filter(
        (doc) => doc.status !== "Uploaded" && doc.status !== "Completed"
      );

      setDocuments(filteredDocuments);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleUpdateStatus = async (documentId, newStatus) => {
    try {
      await axios.put(
        `https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/documents/update-status/${documentId}`,
        { status: newStatus }
      );
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.document_id === documentId ? { ...doc, status: newStatus } : doc
        )
      );
      Swal.fire("Success", `Status updated to ${newStatus}`, "success");
    } catch (error) {
      console.error("Error updating status:", error);
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  const handleViewInvoice = (documentId) => {
    navigate(`/Distributorinvoice/${documentId}`);
  };

  const handleView = (documentId) => {
    navigate(`/Distributorview/${documentId}`);
  };

  const handleUploadCertificate = async (documentId) => {
    if (!selectedFile) {
      Swal.fire("Warning", "Please select a file first", "warning");
      return;
    }

    const selectedDocument = documents.find(
      (doc) => doc.document_id === documentId
    );
    if (!selectedDocument) {
      Swal.fire("Error", "Document not found", "error");
      return;
    }

    const { user_id, application_id, name } = selectedDocument;
    const finalUserId = user_id || distributorId;

    if (!finalUserId || !distributorId || !application_id || !name) {
      Swal.fire(
        "Error",
        "User ID, Distributor ID, Application ID, or Name is missing",
        "error"
      );
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("document_id", documentId.toString());
    formData.append("user_id", finalUserId.toString());
    formData.append("distributor_id", distributorId.toString());
    formData.append("application_id", application_id.toString());
    formData.append("name", name.toString());

    try {
      await axios.post(
        "https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/certificates/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      await axios.put(
        `https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/documents/update-status/${documentId}`,
        { status: "Uploaded" }
      );

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.document_id === documentId
            ? { ...doc, status: "Uploaded" }
            : doc
        )
      );

      Swal.fire("Success", "Certificate uploaded successfully!", "success");
      setSelectedFile(null);
    } catch (error) {
      console.error("Error uploading certificate:", error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Internal server error",
        "error"
      );
    }
  };

  return (
    <div className="ml-[250px] flex flex-col items-center min-h-screen p-6 bg-gray-100">
  <div className="w-[90%] max-w-6xl bg-white shadow-md rounded-lg">
    <div className="bg-[#f5f0eb] border-t-4 shadow-md rounded border-orange-400 p-4">
      <h2 className="text-xl font-bold text-center text-gray-800">
        Manage Distributor List
      </h2>
    </div>
    <div className="p-6 overflow-x-auto">
      <table className="w-full border border-gray-300">
        <thead className="bg-[#f5f0eb]">
          <tr>
            {[
              "Application ID",
              "Category",
              "Subcategory",
              "Verification",
              "Actions",
              "View",
              "Upload Certificate",
            ].map((header, index) => (
              <th
                key={index}
                className="border border-gray-300 p-3 text-center font-semibold text-black"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {documents.map((doc, index) => (
            <tr
              key={doc.document_id}
              className={`border border-gray-300 ${
                index % 2 === 0 ? "bg-[#fffaf4]" : "bg-white"
              }`}
            >
              <td className="border p-3 text-center">{doc.application_id}</td>
              <td className="border p-3 text-center">{doc.category_name}</td>
              <td className="border p-3 text-center">{doc.subcategory_name}</td>
              <td className="border p-3 text-center">
                <span
                  className={`px-3 py-1 rounded-full text-white text-sm ${
                    doc.status === "Processing"
                      ? "bg-orange-500"
                      : doc.status === "Rejected"
                      ? "bg-red-500"
                      : doc.status === "Uploaded"
                      ? "bg-blue-500"
                      : "bg-yellow-500"
                  }`}
                >
                  {doc.status}
                </span>
              </td>
              <td className="border p-3 text-center">
                <button
                  onClick={() => handleViewInvoice(doc.document_id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                >
                  Action
                </button>
              </td>
              <td className="border p-3 text-center">
                <button
                  onClick={() => handleView(doc.document_id)}
                  className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600 transition"
                >
                  View
                </button>
              </td>
              <td className="border p-3 text-center">
                <input
                  type="file"
                  className="mb-2 border p-2 rounded text-sm w-40"
                />
                <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition">
                  Upload
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>


  );
};

export default VerifyDocuments;
