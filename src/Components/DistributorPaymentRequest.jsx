import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import API_BASE_URL from "../config/api";
import { FaCheckCircle, FaTimesCircle, FaMoneyBillWave } from 'react-icons/fa';

const DistributorPaymentRequest = () => {
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Helper function to convert Google Drive URLs to direct image URLs
  const convertGoogleDriveUrl = (url) => {
    if (!url) return url;
    
    // Check if it's a Google Drive URL
    if (url.includes('drive.google.com')) {
      // Extract file ID from various Google Drive URL formats
      let fileId = null;
      
      // Format: https://drive.google.com/file/d/FILE_ID/view or preview
      const match1 = url.match(/\/file\/d\/([^\/]+)/);
      if (match1) {
        fileId = match1[1];
      }
      
      // Format: https://drive.google.com/open?id=FILE_ID
      const match2 = url.match(/[?&]id=([^&]+)/);
      if (match2) {
        fileId = match2[1];
      }
      
      // If we found a file ID, convert to thumbnail URL (more reliable than direct view)
      if (fileId) {
        // Using Google Drive thumbnail API which is more reliable
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
      }
    }
    
    // Return original URL if not a Google Drive link
    return url;
  };

  // Function to get the original Google Drive view URL
  const getGoogleDriveViewUrl = (url) => {
    if (!url) return url;
    
    if (url.includes('drive.google.com')) {
      let fileId = null;
      const match1 = url.match(/\/file\/d\/([^\/]+)/);
      if (match1) fileId = match1[1];
      const match2 = url.match(/[?&]id=([^&]+)/);
      if (match2) fileId = match2[1];
      
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/view`;
      }
    }
    
    return url;
  };

  useEffect(() => {
    fetchPaymentRequests();
    fetchStatistics();
  }, []);

  const fetchPaymentRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/payment-requests`);
      const requests = response.data;
      
      // Get unique distributor IDs
      const distributorIds = [...new Set(requests.map(r => r.distributor_id))];
      
      // Fetch distributor details for each unique ID
      const distributorPromises = distributorIds.map(id =>
        axios.get(`${API_BASE_URL}/users/${id}`).catch(() => null)
      );
      
      const distributorResponses = await Promise.all(distributorPromises);
      
      // Create a map of distributor_id to distributor_name
      const distributorMap = {};
      distributorResponses.forEach((res, index) => {
        if (res && res.data) {
          const distributor = res.data;
          distributorMap[distributorIds[index]] = distributor.name || distributor.full_name || distributor.username || 'Unknown';
        }
      });
      
      // Add distributor names to payment requests
      const requestsWithDistributors = requests.map(req => ({
        ...req,
        distributor_name: distributorMap[req.distributor_id] || 'Unknown'
      }));
      
      setPaymentRequests(requestsWithDistributors);
    } catch (error) {
      console.error('Error fetching payment requests:', error);
      Swal.fire('Error', 'Failed to fetch payment requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payment-requests/statistics`);
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleApprove = async (requestId) => {
    const request = paymentRequests.find(r => r.request_id === requestId);
    
    try {
      // Fetch distributor payment details
      let paymentDetails = null;
      try {
        const paymentDetailsResponse = await axios.get(
          `${API_BASE_URL}/distributor-payment-details/distributor/${request.distributor_id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        paymentDetails = paymentDetailsResponse.data;
      } catch (paymentDetailsError) {
        console.error('Error fetching distributor payment details:', paymentDetailsError);
        if (paymentDetailsError.response && paymentDetailsError.response.status === 404) {
          console.log(`Distributor ${request.distributor_id} has not set up payment details yet`);
        }
      }
      
      // Create payment method options based on available details
      let paymentMethodOptions = '';
      if (paymentDetails?.qr_code_url) {
        paymentMethodOptions += '<option value="qr">QR Code</option>';
      }
      if (paymentDetails?.upi_id) {
        paymentMethodOptions += '<option value="upi">UPI ID</option>';
      }
      if (paymentDetails?.account_number && paymentDetails?.bank_name) {
        paymentMethodOptions += '<option value="bank">Bank Account</option>';
      }
      
      if (!paymentMethodOptions) {
        Swal.fire({
          title: 'No Payment Details',
          text: 'This distributor has not set up their payment details yet. Please ask them to add their bank account, UPI ID, or QR code information before approving payment.',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return;
      }
      
      const { value: formValues } = await Swal.fire({
        title: 'Approve Payment Request',
        html: `
          <div style="text-align: left; max-width: 550px; margin: 0 auto; padding: 10px;">
            <!-- Request Summary -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 15px; border-radius: 8px; color: white; margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 14px; opacity: 0.9;">Distributor:</span>
                <span style="font-weight: bold; font-size: 16px;">${request.distributor_name}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 14px; opacity: 0.9;">Payment Amount:</span>
                <span style="font-weight: bold; font-size: 20px;">₹${request?.amount || 0}</span>
              </div>
            </div>
            
            <!-- Payment Method Selection -->
            <div style="margin-bottom: 20px;">
              <label for="payment-method-select" style="font-weight: 600; display: block; margin-bottom: 8px; color: #374151; font-size: 14px;">
                <svg style="display: inline-block; width: 16px; height: 16px; margin-right: 5px; vertical-align: middle;" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path>
                  <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd"></path>
                </svg>
                Select Payment Method
              </label>
              <select id="payment-method-select" class="swal2-select" 
                      style="width: 100%; padding: 10px; border: 2px solid #e5e7eb; border-radius: 6px; font-size: 14px; background: white; cursor: pointer; transition: all 0.2s;">
                <option value="">Choose payment method...</option>
                ${paymentMethodOptions}
              </select>
            </div>
            
            <!-- Payment Details Display -->
            <div id="payment-details-display" 
                 style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); 
                        padding: 20px; 
                        border-radius: 8px; 
                        margin-bottom: 20px; 
                        display: none; 
                        border: 2px solid #bae6fd;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <!-- Payment details will be inserted here -->
            </div>
            
            <!-- UTR Input -->
            <div style="margin-bottom: 10px;">
              <label for="utr-input" style="font-weight: 600; display: block; margin-bottom: 8px; color: #374151; font-size: 14px;">
                <svg style="display: inline-block; width: 16px; height: 16px; margin-right: 5px; vertical-align: middle;" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
                </svg>
                Transaction Reference Number (UTR)
              </label>
              <input id="utr-input" class="swal2-input" 
                     placeholder="Enter UTR/Transaction ID (Required)" 
                     style="width: 100%; 
                            padding: 10px; 
                            border: 2px solid #e5e7eb; 
                            border-radius: 6px; 
                            font-size: 14px; 
                            font-family: 'Courier New', monospace;
                            margin: 0;">
            </div>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280',
        confirmButtonText: '✓ Approve Payment',
        cancelButtonText: '✕ Cancel',
        width: '650px',
        didOpen: () => {
          const paymentMethodSelect = document.getElementById('payment-method-select');
          const paymentDetailsDisplay = document.getElementById('payment-details-display');
          
          paymentMethodSelect.addEventListener('change', (e) => {
            const selectedMethod = e.target.value;
            
            if (!selectedMethod) {
              paymentDetailsDisplay.style.display = 'none';
              paymentMethodSelect.style.borderColor = '#e5e7eb';
              return;
            }
            
            // Highlight selected dropdown
            paymentMethodSelect.style.borderColor = '#3b82f6';
            paymentMethodSelect.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            
            let detailsHtml = '';
            
            if (selectedMethod === 'qr' && paymentDetails.qr_code_url) {
              const qrImageUrl = convertGoogleDriveUrl(paymentDetails.qr_code_url);
              const qrViewUrl = getGoogleDriveViewUrl(paymentDetails.qr_code_url);
              
              detailsHtml = `
                <div style="text-align: center;">
                  <div style="display: inline-flex; align-items: center; gap: 10px; margin-bottom: 15px; background: white; padding: 8px 16px; border-radius: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <svg style="width: 20px; height: 20px; color: #2563eb;" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clip-rule="evenodd"></path>
                      <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM7 11a1 1 0 100-2H4a1 1 0 100 2h3zM17 13a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM16 17a1 1 0 100-2h-3a1 1 0 100 2h3z"></path>
                    </svg>
                    <span style="font-weight: 600; color: #1e40af; font-size: 16px;">QR Code Payment</span>
                  </div>
                  
                  <div style="background: white; padding: 20px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 300px;">
                    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 2px dashed #3b82f6;">
                      <p style="color: #1e40af; margin: 0 0 12px 0; font-weight: 600; font-size: 14px;">📱 View QR Code to Pay</p>
                      <a href="${qrViewUrl}" target="_blank" 
                         style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3); transition: all 0.2s; width: 100%;"
                         onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 10px rgba(59, 130, 246, 0.4)';"
                         onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(59, 130, 246, 0.3)';">
                        🔗 Open QR Code
                      </a>
                      <p style="font-size: 11px; color: #64748b; margin: 10px 0 0 0; line-height: 1.4;">Click above to open QR code in new window, then scan with your UPI app</p>
                    </div>
                  </div>
                  ${paymentDetails.upi_id ? `
                    <div style="margin-top: 12px; padding: 10px; background: white; border-radius: 8px; display: inline-block;">
                      <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">UPI ID</div>
                      <code style="background: #f3f4f6; padding: 6px 12px; border-radius: 6px; font-size: 13px; color: #1f2937; font-weight: 500;">${paymentDetails.upi_id}</code>
                    </div>
                  ` : ''}
                  <div style="margin-top: 12px; font-size: 12px; color: #6b7280;">
                    📱 Scan this QR code with any UPI app to pay
                  </div>
                </div>
              `;
            } else if (selectedMethod === 'upi' && paymentDetails.upi_id) {
              detailsHtml = `
                <div>
                  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px; justify-content: center;">
                    <svg style="width: 24px; height: 24px; color: #059669;" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path>
                    </svg>
                    <span style="font-weight: 600; color: #047857; font-size: 18px;">UPI Payment</span>
                  </div>
                  <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                    <div style="margin-bottom: 12px;">
                      <div style="font-size: 12px; color: #6b7280; margin-bottom: 6px; text-align: left;">UPI ID</div>
                      <div style="display: flex; align-items: center; gap: 10px; background: #f0fdf4; padding: 12px; border-radius: 8px; border: 1px solid #bbf7d0;">
                        <code style="flex: 1; font-size: 15px; color: #065f46; font-weight: 600; word-break: break-all;">${paymentDetails.upi_id}</code>
                        <button type="button" onclick="navigator.clipboard.writeText('${paymentDetails.upi_id}'); this.innerHTML='✓ Copied'; setTimeout(() => this.innerHTML='📋 Copy', 2000);" 
                                style="background: #10b981; color: white; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-size: 12px; white-space: nowrap; font-weight: 500; transition: all 0.2s;">
                          📋 Copy
                        </button>
                      </div>
                    </div>
                    <div style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 10px;">
                      💳 Use this UPI ID in your payment app
                    </div>
                  </div>
                </div>
              `;
            } else if (selectedMethod === 'bank' && paymentDetails.account_number && paymentDetails.bank_name) {
              detailsHtml = `
                <div>
                  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px; justify-content: center;">
                    <svg style="width: 24px; height: 24px; color: #7c3aed;" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path>
                      <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd"></path>
                    </svg>
                    <span style="font-weight: 600; color: #6d28d9; font-size: 18px;">Bank Transfer</span>
                  </div>
                  <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                    <div style="display: grid; gap: 14px;">
                      <div style="text-align: left;">
                        <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Account Holder</div>
                        <div style="font-weight: 600; color: #1f2937; font-size: 15px;">${paymentDetails.account_holder_name || 'N/A'}</div>
                      </div>
                      <div style="text-align: left;">
                        <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Bank Name</div>
                        <div style="font-weight: 600; color: #1f2937; font-size: 15px;">${paymentDetails.bank_name}</div>
                      </div>
                      <div style="text-align: left; background: #faf5ff; padding: 10px; border-radius: 6px; border: 1px solid #e9d5ff;">
                        <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Account Number</div>
                        <code style="font-size: 16px; color: #6d28d9; font-weight: 600; letter-spacing: 1px;">${paymentDetails.account_number}</code>
                      </div>
                      <div style="text-align: left; background: #faf5ff; padding: 10px; border-radius: 6px; border: 1px solid #e9d5ff;">
                        <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">IFSC Code</div>
                        <code style="font-size: 16px; color: #6d28d9; font-weight: 600; letter-spacing: 1px;">${paymentDetails.ifsc_code || 'N/A'}</code>
                      </div>
                    </div>
                    <div style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 14px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                      🏦 Use these details for bank transfer or NEFT/RTGS/IMPS
                    </div>
                  </div>
                </div>
              `;
            }
            
            // Fade in animation
            paymentDetailsDisplay.style.opacity = '0';
            paymentDetailsDisplay.style.display = 'block';
            paymentDetailsDisplay.innerHTML = detailsHtml;
            
            setTimeout(() => {
              paymentDetailsDisplay.style.transition = 'opacity 0.3s ease-in-out';
              paymentDetailsDisplay.style.opacity = '1';
            }, 10);
          });
        },
        preConfirm: () => {
          const utr = document.getElementById('utr-input').value.trim();
          const paymentMethod = document.getElementById('payment-method-select').value;
          
          if (!paymentMethod) {
            Swal.showValidationMessage('Please select a payment method');
            return false;
          }
          if (!utr) {
            Swal.showValidationMessage('UTR Number is required');
            return false;
          }
          return { utr, paymentMethod };
        }
      });

      if (formValues) {
        try {
          await axios.put(`${API_BASE_URL}/payment-requests/${requestId}/status`, {
            status: 'Approved',
            utr_number: formValues.utr || null,
            payment_method: formValues.paymentMethod || null,
          });
          
          const methodText = formValues.paymentMethod === 'qr' ? 'QR Code' : 
                            formValues.paymentMethod === 'upi' ? 'UPI' : 'Bank Transfer';
          
          Swal.fire(
            'Payment Approved!', 
            `Payment has been processed successfully via ${methodText}.\nUTR: ${formValues.utr}`, 
            'success'
          );
          fetchPaymentRequests();
          fetchStatistics();
        } catch (error) {
          console.error('Error approving payment:', error);
          Swal.fire(
            'Error',
            error.response?.data?.message || 'Failed to approve payment request',
            'error'
          );
        }
      }
    } catch (paymentDetailsError) {
      console.error('Error fetching payment details:', paymentDetailsError);
      
      // Fallback to simple approval if payment details are not available
      const { value: formValues } = await Swal.fire({
        title: 'Approve Payment Request',
        html: `
          <p><strong>Distributor:</strong> ${request.distributor_name}</p>
          <p><strong>Amount:</strong> ₹${request?.amount || 0}</p>
          <p style="color: #f59e0b; font-size: 14px; margin-top: 10px;">⚠️ Payment details not available for this distributor</p>
          <input id="utr-input" class="swal2-input" placeholder="Enter UTR Number (Required)">
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, approve it!',
        preConfirm: () => {
          const utr = document.getElementById('utr-input').value.trim();
          if (!utr) {
            Swal.showValidationMessage('UTR Number is required');
            return false;
          }
          return { utr };
        }
      });
      
      if (formValues) {
        try {
          await axios.put(`${API_BASE_URL}/payment-requests/${requestId}/status`, {
            status: 'Approved',
            utr_number: formValues.utr || null,
          });
          Swal.fire('Approved!', `Payment has been processed successfully.\nUTR: ${formValues.utr}`, 'success');
          fetchPaymentRequests();
          fetchStatistics();
        } catch (error) {
          console.error('Error approving payment:', error);
          Swal.fire(
            'Error',
            error.response?.data?.message || 'Failed to approve payment request',
            'error'
          );
        }
      }
    }
  };

  const handleReject = async (requestId) => {
    const { value: reason } = await Swal.fire({
      title: 'Reject Payment Request',
      input: 'textarea',
      inputLabel: 'Rejection Reason',
      inputPlaceholder: 'Enter reason for rejection...',
      inputAttributes: {
        'aria-label': 'Enter reason for rejection',
      },
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to provide a reason!';
        }
      },
    });

    if (reason) {
      try {
        await axios.put(`${API_BASE_URL}/payment-requests/${requestId}/status`, {
          status: 'Rejected',
          rejection_reason: reason,
        });
        Swal.fire('Rejected!', 'Payment request has been rejected.', 'success');
        fetchPaymentRequests();
        fetchStatistics();
      } catch (error) {
        console.error('Error rejecting payment:', error);
        Swal.fire('Error', 'Failed to reject payment request', 'error');
      }
    }
  };

  const handleBulkApprove = async () => {
    if (selectedRequests.length === 0) {
      Swal.fire('Warning', 'Please select at least one payment request', 'warning');
      return;
    }

    // Get all selected requests details
    const selectedRequestsData = selectedRequests.map(id => 
      paymentRequests.find(r => r.request_id === id)
    ).filter(r => r);

    // Check if all selected requests are from the same distributor
    const distributorIds = [...new Set(selectedRequestsData.map(r => r.distributor_id))];
    
    if (distributorIds.length > 1) {
      Swal.fire({
        icon: 'error',
        title: 'Multiple Distributors Selected',
        text: 'You can only process payments for one distributor at a time. Please select payments from a single distributor.',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    const distributorId = distributorIds[0];
    const distributorName = selectedRequestsData[0].distributor_name;
    
    const totalAmount = selectedRequestsData.reduce((sum, request) => {
      return sum + Number(request.amount);
    }, 0);

    try {
      // Fetch distributor payment details
      let paymentDetails = null;
      try {
        const paymentDetailsResponse = await axios.get(
          `${API_BASE_URL}/distributor-payment-details/distributor/${distributorId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        paymentDetails = paymentDetailsResponse.data;
      } catch (paymentDetailsError) {
        console.error('Error fetching distributor payment details:', paymentDetailsError);
        if (paymentDetailsError.response && paymentDetailsError.response.status === 404) {
          console.log(`Distributor ${distributorId} has not set up payment details yet`);
        }
      }
      
      // Create payment method options based on available details
      let paymentMethodOptions = '';
      if (paymentDetails?.qr_code_url) {
        paymentMethodOptions += '<option value="qr">QR Code</option>';
      }
      if (paymentDetails?.upi_id) {
        paymentMethodOptions += '<option value="upi">UPI ID</option>';
      }
      if (paymentDetails?.account_number && paymentDetails?.bank_name) {
        paymentMethodOptions += '<option value="bank">Bank Account</option>';
      }
      
      if (!paymentMethodOptions) {
        Swal.fire({
          title: 'No Payment Details',
          text: 'This distributor has not set up their payment details yet. Please ask them to add their bank account, UPI ID, or QR code information before approving payment.',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return;
      }
      
      const { value: formValues } = await Swal.fire({
        title: 'Approve Bulk Payment Requests',
        html: `
          <div style="text-align: left; max-width: 550px; margin: 0 auto; padding: 10px;">
            <!-- Request Summary -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 15px; border-radius: 8px; color: white; margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 14px; opacity: 0.9;">Distributor:</span>
                <span style="font-weight: bold; font-size: 16px;">${distributorName}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 14px; opacity: 0.9;">Payment Requests:</span>
                <span style="font-weight: bold; font-size: 16px;">${selectedRequests.length} requests</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 14px; opacity: 0.9;">Total Amount:</span>
                <span style="font-weight: bold; font-size: 20px;">₹${totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <!-- Payment Method Selection -->
            <div style="margin-bottom: 20px;">
              <label for="payment-method-select" style="font-weight: 600; display: block; margin-bottom: 8px; color: #374151; font-size: 14px;">
                <svg style="display: inline-block; width: 16px; height: 16px; margin-right: 5px; vertical-align: middle;" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path>
                  <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd"></path>
                </svg>
                Select Payment Method
              </label>
              <select id="payment-method-select" class="swal2-select" 
                      style="width: 100%; padding: 10px; border: 2px solid #e5e7eb; border-radius: 6px; font-size: 14px; background: white; cursor: pointer; transition: all 0.2s;">
                <option value="">Choose payment method...</option>
                ${paymentMethodOptions}
              </select>
            </div>
            
            <!-- Payment Details Display -->
            <div id="payment-details-display" 
                 style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); 
                        padding: 20px; 
                        border-radius: 8px; 
                        margin-bottom: 20px; 
                        display: none; 
                        border: 2px solid #bae6fd;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <!-- Payment details will be inserted here -->
            </div>
            
            <!-- UTR Input -->
            <div style="margin-bottom: 10px;">
              <label for="utr-input" style="font-weight: 600; display: block; margin-bottom: 8px; color: #374151; font-size: 14px;">
                <svg style="display: inline-block; width: 16px; height: 16px; margin-right: 5px; vertical-align: middle;" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
                </svg>
                Transaction Reference Number (UTR)
              </label>
              <input id="utr-input" class="swal2-input" 
                     placeholder="Enter UTR/Transaction ID (Required)" 
                     style="width: 100%; 
                            padding: 10px; 
                            border: 2px solid #e5e7eb; 
                            border-radius: 6px; 
                            font-size: 14px; 
                            font-family: 'Courier New', monospace;
                            margin: 0;">
            </div>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280',
        confirmButtonText: '✓ Approve All Payments',
        cancelButtonText: '✕ Cancel',
        width: '650px',
        didOpen: () => {
          const paymentMethodSelect = document.getElementById('payment-method-select');
          const paymentDetailsDisplay = document.getElementById('payment-details-display');
          
          paymentMethodSelect.addEventListener('change', (e) => {
            const selectedMethod = e.target.value;
            
            if (!selectedMethod) {
              paymentDetailsDisplay.style.display = 'none';
              paymentMethodSelect.style.borderColor = '#e5e7eb';
              return;
            }
            
            // Highlight selected dropdown
            paymentMethodSelect.style.borderColor = '#3b82f6';
            paymentMethodSelect.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            
            let detailsHtml = '';
            
            if (selectedMethod === 'qr' && paymentDetails.qr_code_url) {
              const qrImageUrl = convertGoogleDriveUrl(paymentDetails.qr_code_url);
              const qrViewUrl = getGoogleDriveViewUrl(paymentDetails.qr_code_url);
              
              detailsHtml = `
                <div style="text-align: center;">
                  <div style="display: inline-flex; align-items: center; gap: 10px; margin-bottom: 15px; background: white; padding: 8px 16px; border-radius: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <svg style="width: 20px; height: 20px; color: #2563eb;" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clip-rule="evenodd"></path>
                      <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM7 11a1 1 0 100-2H4a1 1 0 100 2h3zM17 13a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM16 17a1 1 0 100-2h-3a1 1 0 100 2h3z"></path>
                    </svg>
                    <span style="font-weight: 600; color: #1e40af; font-size: 16px;">QR Code Payment</span>
                  </div>
                  
                  <div style="background: white; padding: 20px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 300px;">
                    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 2px dashed #3b82f6;">
                      <p style="color: #1e40af; margin: 0 0 12px 0; font-weight: 600; font-size: 14px;">📱 View QR Code to Pay</p>
                      <a href="${qrViewUrl}" target="_blank" 
                         style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3); transition: all 0.2s; width: 100%;"
                         onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 10px rgba(59, 130, 246, 0.4)';"
                         onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(59, 130, 246, 0.3)';">
                        🔗 Open QR Code
                      </a>
                      <p style="font-size: 11px; color: #64748b; margin: 10px 0 0 0; line-height: 1.4;">Click above to open QR code in new window, then scan with your UPI app</p>
                    </div>
                  </div>
                  ${paymentDetails.upi_id ? `
                    <div style="margin-top: 12px; padding: 10px; background: white; border-radius: 8px; display: inline-block;">
                      <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">UPI ID</div>
                      <code style="background: #f3f4f6; padding: 6px 12px; border-radius: 6px; font-size: 13px; color: #1f2937; font-weight: 500;">${paymentDetails.upi_id}</code>
                    </div>
                  ` : ''}
                  <div style="margin-top: 12px; font-size: 12px; color: #6b7280;">
                    📱 Scan this QR code with any UPI app to pay ₹${totalAmount.toFixed(2)}
                  </div>
                </div>
              `;
            } else if (selectedMethod === 'upi' && paymentDetails.upi_id) {
              detailsHtml = `
                <div>
                  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px; justify-content: center;">
                    <svg style="width: 24px; height: 24px; color: #059669;" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path>
                    </svg>
                    <span style="font-weight: 600; color: #047857; font-size: 18px;">UPI Payment</span>
                  </div>
                  <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                    <div style="margin-bottom: 12px;">
                      <div style="font-size: 12px; color: #6b7280; margin-bottom: 6px; text-align: left;">UPI ID</div>
                      <div style="display: flex; align-items: center; gap: 10px; background: #f0fdf4; padding: 12px; border-radius: 8px; border: 1px solid #bbf7d0;">
                        <code style="flex: 1; font-size: 15px; color: #065f46; font-weight: 600; word-break: break-all;">${paymentDetails.upi_id}</code>
                        <button type="button" onclick="navigator.clipboard.writeText('${paymentDetails.upi_id}'); this.innerHTML='✓ Copied'; setTimeout(() => this.innerHTML='📋 Copy', 2000);" 
                                style="background: #10b981; color: white; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-size: 12px; white-space: nowrap; font-weight: 500; transition: all 0.2s;">
                          📋 Copy
                        </button>
                      </div>
                    </div>
                    <div style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 10px;">
                      💳 Use this UPI ID to pay ₹${totalAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
              `;
            } else if (selectedMethod === 'bank' && paymentDetails.account_number && paymentDetails.bank_name) {
              detailsHtml = `
                <div>
                  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px; justify-content: center;">
                    <svg style="width: 24px; height: 24px; color: #7c3aed;" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path>
                      <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd"></path>
                    </svg>
                    <span style="font-weight: 600; color: #6d28d9; font-size: 18px;">Bank Transfer</span>
                  </div>
                  <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                    <div style="display: grid; gap: 14px;">
                      <div style="text-align: left;">
                        <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Account Holder</div>
                        <div style="font-weight: 600; color: #1f2937; font-size: 15px;">${paymentDetails.account_holder_name || 'N/A'}</div>
                      </div>
                      <div style="text-align: left;">
                        <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Bank Name</div>
                        <div style="font-weight: 600; color: #1f2937; font-size: 15px;">${paymentDetails.bank_name}</div>
                      </div>
                      <div style="text-align: left; background: #faf5ff; padding: 10px; border-radius: 6px; border: 1px solid #e9d5ff;">
                        <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Account Number</div>
                        <code style="font-size: 16px; color: #6d28d9; font-weight: 600; letter-spacing: 1px;">${paymentDetails.account_number}</code>
                      </div>
                      <div style="text-align: left; background: #faf5ff; padding: 10px; border-radius: 6px; border: 1px solid #e9d5ff;">
                        <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">IFSC Code</div>
                        <code style="font-size: 16px; color: #6d28d9; font-weight: 600; letter-spacing: 1px;">${paymentDetails.ifsc_code || 'N/A'}</code>
                      </div>
                    </div>
                    <div style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 14px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                      🏦 Transfer ₹${totalAmount.toFixed(2)} using these details
                    </div>
                  </div>
                </div>
              `;
            }
            
            // Fade in animation
            paymentDetailsDisplay.style.opacity = '0';
            paymentDetailsDisplay.style.display = 'block';
            paymentDetailsDisplay.innerHTML = detailsHtml;
            
            setTimeout(() => {
              paymentDetailsDisplay.style.transition = 'opacity 0.3s ease-in-out';
              paymentDetailsDisplay.style.opacity = '1';
            }, 10);
          });
        },
        preConfirm: () => {
          const utr = document.getElementById('utr-input').value.trim();
          const paymentMethod = document.getElementById('payment-method-select').value;
          
          if (!paymentMethod) {
            Swal.showValidationMessage('Please select a payment method');
            return false;
          }
          if (!utr) {
            Swal.showValidationMessage('UTR Number is required');
            return false;
          }
          return { utr, paymentMethod };
        }
      });

      if (formValues) {
        try {
          // Approve each selected request with UTR and payment method
          await Promise.all(
            selectedRequests.map(requestId =>
              axios.put(`${API_BASE_URL}/payment-requests/${requestId}/status`, {
                status: 'Approved',
                utr_number: formValues.utr || null,
                payment_method: formValues.paymentMethod || null,
              })
            )
          );
          
          const methodText = formValues.paymentMethod === 'qr' ? 'QR Code' : 
                            formValues.paymentMethod === 'upi' ? 'UPI' : 'Bank Transfer';
          
          Swal.fire(
            'Payments Approved!', 
            `${selectedRequests.length} payment(s) have been processed successfully via ${methodText}.\nTotal Amount: ₹${totalAmount.toFixed(2)}\nUTR: ${formValues.utr}`, 
            'success'
          );
          setSelectedRequests([]);
          fetchPaymentRequests();
          fetchStatistics();
        } catch (error) {
          console.error('Error approving payments:', error);
          Swal.fire(
            'Error',
            error.response?.data?.message || 'Failed to approve some payment requests',
            'error'
          );
        }
      }
    } catch (paymentDetailsError) {
      console.error('Error in bulk approval:', paymentDetailsError);
      Swal.fire('Error', 'Failed to process bulk payment approval', 'error');
    }
  };

  const toggleSelectRequest = (requestId) => {
    setSelectedRequests(prev =>
      prev.includes(requestId)
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const toggleSelectAll = () => {
    const pendingRequests = filteredRequests.filter(r => r.status === 'Pending');
    if (selectedRequests.length === pendingRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(pendingRequests.map(r => r.request_id));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredRequests = paymentRequests.filter(req => {
    // Status filter
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    
    // Search filter - search across available fields including distributor name
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || (
      req.distributor_name?.toLowerCase().includes(searchLower) ||
      req.applicant_name?.toLowerCase().includes(searchLower) ||
      req.category_name?.toLowerCase().includes(searchLower) ||
      req.subcategory_name?.toLowerCase().includes(searchLower) ||
      req.amount?.toString().includes(searchLower) ||
      req.request_id?.toString().includes(searchLower) ||
      req.application_id?.toLowerCase().includes(searchLower) ||
      req.utr_number?.toLowerCase().includes(searchLower) ||
      req.status?.toLowerCase().includes(searchLower)
    );
    
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="ml-[300px] p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="ml-[300px] p-6 bg-gray-100 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Requests Dashboard</h1>
        <p className="text-gray-600">Review and manage distributor payment requests</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
              </div>
              <FaMoneyBillWave className="text-3xl text-blue-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">{formatCurrency(statistics.totalAmount)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{statistics.pending}</p>
              </div>
              <FaMoneyBillWave className="text-3xl text-yellow-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">{formatCurrency(statistics.pendingAmount)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-green-600">{statistics.paid}</p>
              </div>
              <FaCheckCircle className="text-3xl text-green-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">{formatCurrency(statistics.paidAmount)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{statistics.rejected}</p>
              </div>
              <FaTimesCircle className="text-3xl text-red-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-[500px]">
            <input
              type="text"
              placeholder="Search by distributor, applicant, category, application ID, amount, UTR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Paid">Paid</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-600">
            Showing {filteredRequests.length} of {paymentRequests.length} request(s)
            {searchTerm && <span className="ml-2 text-orange-600 font-semibold">(Filtered by search)</span>}
          </span>
          
          {selectedRequests.length > 0 && (
            <button
              onClick={handleBulkApprove}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition flex items-center gap-2 font-semibold shadow-md"
            >
              <FaCheckCircle /> Approve Selected ({selectedRequests.length}) - ₹
              {selectedRequests.reduce((sum, id) => {
                const req = paymentRequests.find(r => r.request_id === id);
                return sum + (req ? Number(req.amount) : 0);
              }, 0).toFixed(2)}
            </button>
          )}
        </div>
      </div>

      {/* Payment Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedRequests.length > 0 && selectedRequests.length === filteredRequests.filter(r => r.status === 'Pending').length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Application ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Distributor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category / Subcategory
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UTR Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-6 py-4 text-center text-gray-500">
                    No payment requests found
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.request_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.status === 'Pending' && (
                        <input
                          type="checkbox"
                          checked={selectedRequests.includes(request.request_id)}
                          onChange={() => toggleSelectRequest(request.request_id)}
                          className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{request.request_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.application_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {request.distributor_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.applicant_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>{request.category_name}</div>
                      <div className="text-xs text-gray-500">{request.subcategory_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(request.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          request.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : request.status === 'Approved' || request.status === 'Paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.utr_number ? (
                        <span className="font-mono bg-blue-50 px-2 py-1 rounded text-blue-700">
                          {request.utr_number}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {request.status === 'Pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(request.request_id)}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition flex items-center gap-1"
                          >
                            <FaCheckCircle /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(request.request_id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition flex items-center gap-1"
                          >
                            <FaTimesCircle /> Reject
                          </button>
                        </div>
                      ) : request.status === 'Rejected' && request.rejection_reason ? (
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Reason:</span> {request.rejection_reason}
                        </div>
                      ) : (
                        <span className="text-gray-400">No actions available</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DistributorPaymentRequest;
