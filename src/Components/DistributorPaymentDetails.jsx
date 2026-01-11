import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import jwtDecode from "jwt-decode";
import API_BASE_URL from "../config/api";
import { FaSave, FaTrash, FaEdit, FaEye, FaEyeSlash } from "react-icons/fa";

const DistributorPaymentDetails = () => {
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  
  const [formData, setFormData] = useState({
    account_holder_name: "",
    account_number: "",
    bank_name: "",
    ifsc_code: "",
    upi_id: "",
  });
  
  const [qrCodeFile, setQrCodeFile] = useState(null);
  const [qrCodePreview, setQrCodePreview] = useState(null);

  useEffect(() => {
    fetchPaymentDetails();
  }, []);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        Swal.fire("Error", "Authentication token not found", "error");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/distributor-payment-details/my-details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setPaymentDetails(response.data);
        setFormData({
          account_holder_name: response.data.account_holder_name || "",
          account_number: response.data.account_number || "",
          bank_name: response.data.bank_name || "",
          ifsc_code: response.data.ifsc_code || "",
          upi_id: response.data.upi_id || "",
        });
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      // If 404, means no details exist yet - that's ok
      if (error.response?.status !== 404) {
        Swal.fire("Error", "Failed to fetch payment details", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        Swal.fire("Error", "Please select an image file", "error");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire("Error", "File size should be less than 5MB", "error");
        return;
      }
      
      setQrCodeFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setQrCodePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setUploading(true);
      
      // Validate required fields
      if (!formData.account_holder_name && !formData.upi_id) {
        Swal.fire("Error", "Please provide at least account holder name or UPI ID", "error");
        return;
      }

      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      // Append form fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Append file if selected
      if (qrCodeFile) {
        formDataToSend.append('qr_code', qrCodeFile);
      }

      await axios.post(`${API_BASE_URL}/distributor-payment-details`, formDataToSend, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      Swal.fire("Success!", "Payment details saved successfully", "success");
      setIsEditing(false);
      setQrCodeFile(null);
      setQrCodePreview(null);
      await fetchPaymentDetails();
    } catch (error) {
      console.error('Error saving payment details:', error);
      Swal.fire("Error", error.response?.data?.message || "Failed to save payment details", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete all your payment details",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/distributor-payment-details`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        Swal.fire("Deleted!", "Payment details deleted successfully", "success");
        setPaymentDetails(null);
        setFormData({
          account_holder_name: "",
          account_number: "",
          bank_name: "",
          ifsc_code: "",
          upi_id: "",
        });
        setIsEditing(false);
      } catch (error) {
        console.error('Error deleting payment details:', error);
        Swal.fire("Error", "Failed to delete payment details", "error");
      }
    }
  };

  const maskAccountNumber = (accountNumber) => {
    if (!accountNumber || accountNumber.length < 4) return accountNumber;
    return accountNumber.slice(0, -4).replace(/./g, '*') + accountNumber.slice(-4);
  };

  if (loading) {
    return (
      <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-300px)] flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-300px)] overflow-x-auto">
      <div className="bg-white shadow rounded border">
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t">
          <h2 className="text-2xl font-bold text-center">My Payment Details</h2>
          <p className="text-center text-gray-600 text-sm mt-1">
            Manage your bank account and UPI details for receiving payments
          </p>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              {paymentDetails ? (
                <span className="text-green-600 text-sm">✓ Payment details configured</span>
              ) : (
                <span className="text-orange-600 text-sm">⚠ No payment details configured</span>
              )}
            </div>
            <div className="flex gap-2">
              {!isEditing && paymentDetails && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
                >
                  <FaEdit /> Edit Details
                </button>
              )}
              {!isEditing && !paymentDetails && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 flex items-center gap-2"
                >
                  <FaSave /> Add Payment Details
                </button>
              )}
              {paymentDetails && (
                <button
                  onClick={handleDelete}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center gap-2"
                >
                  <FaTrash /> Delete
                </button>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-6">
              {/* Bank Account Details */}
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Bank Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-2">Account Holder Name</label>
                    <input
                      type="text"
                      name="account_holder_name"
                      value={formData.account_holder_name}
                      onChange={handleInputChange}
                      className="w-full border p-3 rounded focus:ring-2 focus:ring-orange-400"
                      placeholder="Enter account holder name"
                    />
                  </div>
                  
                  <div>
                    <label className="block font-semibold mb-2">Account Number</label>
                    <input
                      type="text"
                      name="account_number"
                      value={formData.account_number}
                      onChange={handleInputChange}
                      className="w-full border p-3 rounded focus:ring-2 focus:ring-orange-400"
                      placeholder="Enter account number"
                    />
                  </div>
                  
                  <div>
                    <label className="block font-semibold mb-2">Bank Name</label>
                    <input
                      type="text"
                      name="bank_name"
                      value={formData.bank_name}
                      onChange={handleInputChange}
                      className="w-full border p-3 rounded focus:ring-2 focus:ring-orange-400"
                      placeholder="Enter bank name"
                    />
                  </div>
                  
                  <div>
                    <label className="block font-semibold mb-2">IFSC Code</label>
                    <input
                      type="text"
                      name="ifsc_code"
                      value={formData.ifsc_code}
                      onChange={handleInputChange}
                      className="w-full border p-3 rounded focus:ring-2 focus:ring-orange-400"
                      placeholder="Enter IFSC code"
                    />
                  </div>
                </div>
              </div>

              {/* UPI Details */}
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">UPI Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-2">UPI ID</label>
                    <input
                      type="text"
                      name="upi_id"
                      value={formData.upi_id}
                      onChange={handleInputChange}
                      className="w-full border p-3 rounded focus:ring-2 focus:ring-orange-400"
                      placeholder="yourname@paytm"
                    />
                  </div>
                  
                  <div>
                    <label className="block font-semibold mb-2">QR Code</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full border p-3 rounded focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                </div>
                
                {qrCodePreview && (
                  <div className="mt-4">
                    <p className="font-semibold mb-2">QR Code Preview:</p>
                    <img 
                      src={qrCodePreview} 
                      alt="QR Code Preview" 
                      className="w-32 h-32 object-cover border rounded"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  disabled={uploading}
                  className={`px-6 py-3 rounded text-white flex items-center gap-2 ${
                    uploading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  <FaSave /> {uploading ? 'Saving...' : 'Save Details'}
                </button>
                
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setQrCodeFile(null);
                    setQrCodePreview(null);
                    // Reset form to current data
                    if (paymentDetails) {
                      setFormData({
                        account_holder_name: paymentDetails.account_holder_name || "",
                        account_number: paymentDetails.account_number || "",
                        bank_name: paymentDetails.bank_name || "",
                        ifsc_code: paymentDetails.ifsc_code || "",
                        upi_id: paymentDetails.upi_id || "",
                      });
                    }
                  }}
                  className="px-6 py-3 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            paymentDetails ? (
              <div className="space-y-6">
                {/* Display Bank Details */}
                {(paymentDetails.account_holder_name || paymentDetails.account_number) && (
                  <div className="bg-blue-50 p-4 rounded">
                    <h3 className="text-lg font-semibold mb-4 text-blue-800">Bank Account Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {paymentDetails.account_holder_name && (
                        <div>
                          <label className="block font-semibold text-gray-600">Account Holder Name</label>
                          <p className="text-lg">{paymentDetails.account_holder_name}</p>
                        </div>
                      )}
                      
                      {paymentDetails.account_number && (
                        <div>
                          <label className="block font-semibold text-gray-600">Account Number</label>
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-mono">
                              {showAccountNumber ? paymentDetails.account_number : maskAccountNumber(paymentDetails.account_number)}
                            </p>
                            <button
                              onClick={() => setShowAccountNumber(!showAccountNumber)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {showAccountNumber ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {paymentDetails.bank_name && (
                        <div>
                          <label className="block font-semibold text-gray-600">Bank Name</label>
                          <p className="text-lg">{paymentDetails.bank_name}</p>
                        </div>
                      )}
                      
                      {paymentDetails.ifsc_code && (
                        <div>
                          <label className="block font-semibold text-gray-600">IFSC Code</label>
                          <p className="text-lg font-mono">{paymentDetails.ifsc_code}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Display UPI Details */}
                {(paymentDetails.upi_id || paymentDetails.qr_code_url) && (
                  <div className="bg-green-50 p-4 rounded">
                    <h3 className="text-lg font-semibold mb-4 text-green-800">UPI Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {paymentDetails.upi_id && (
                        <div>
                          <label className="block font-semibold text-gray-600">UPI ID</label>
                          <p className="text-lg font-mono">{paymentDetails.upi_id}</p>
                        </div>
                      )}
                      
                      {paymentDetails.qr_code_url && (
                        <div>
                          <label className="block font-semibold text-gray-600">QR Code</label>
                          <img 
                            src={paymentDetails.qr_code_url} 
                            alt="Payment QR Code" 
                            className="w-32 h-32 object-cover border rounded mt-2"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="text-sm text-gray-500">
                  <p>Last updated: {new Date(paymentDetails.updated_at).toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No payment details configured yet.</p>
                <p className="text-sm text-gray-400">
                  Add your bank account and UPI details to receive payments from admin.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default DistributorPaymentDetails;