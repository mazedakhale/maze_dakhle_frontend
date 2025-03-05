import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useLocation, useParams } from 'react-router-dom';
import logo1 from '../assets/logo.png';

const ApplicationView = () => {
  const { documentId } = useParams();
  const location = useLocation();
  const { categoryId: stateCategoryId, subcategoryId: stateSubcategoryId } = location.state || {};

  const [documentData, setDocumentData] = useState({});
  const [documentNames, setDocumentNames] = useState([]);
  const printRef = useRef();

  useEffect(() => {
    console.log("Fetched from previous page state:");
    console.log("Document ID:", documentId);
    console.log("Category ID:", stateCategoryId);
    console.log("Subcategory ID:", stateSubcategoryId);
  }, [documentId, stateCategoryId, stateSubcategoryId]);

  // Fetch Document Data
  const fetchDocumentData = useCallback(async () => {
    try {
      const response = await axios.get(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/singledocument/documentby/${documentId}`);
      const data = response.data.document;
      setDocumentData(data);

      const category = stateCategoryId || data.category_id;
      const subcategory = stateSubcategoryId || data.subcategory_id;

      if (category && subcategory) {
        const fieldNamesResponse = await axios.get(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/field-names/${category}/${subcategory}`);
        setDocumentNames(fieldNamesResponse.data);
      }
    } catch (error) {
      console.error('Error fetching document data:', error);
    }
  }, [documentId, stateCategoryId, stateSubcategoryId]);

  useEffect(() => {
    if (documentId) {
      fetchDocumentData();
    }
  }, [documentId, fetchDocumentData]);

  // Print Handler
  // Print Handler
  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=600,width=800');

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Application</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            h2, h3 { text-align: center; }
            img { display: block; margin: 0 auto; max-width: 100px; height: auto; }
            @media print {
              body { -webkit-print-color-adjust: exact; }
              table th, table td { border: 1px solid #ccc; }
            }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  if (!documentData) return <div className="text-center text-lg mt-10">Loading Invoice...</div>;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100 z-50">
      <div className="w-4/5 max-w-4xl border rounded-lg shadow-lg bg-white p-6 overflow-auto h-[90vh] relative">

        {/* Centered Print Button */}
        <div className="w-full flex justify-center mb-4 print:hidden">
          <button
            onClick={handlePrint}
            className="bg-[#00234E] text-white px-6 py-3 rounded-lg hover:bg-blue-900"
          >
            Print
          </button>
        </div>

        {/* Horizontal Line */}
        <hr className="mb-4" />

        {/* Printable Area */}
        <div ref={printRef}>
          {/* Header */}
          <div className="w-full flex items-center justify-between border-b pb-4 mb-4">
            <img src={logo1} alt="Logo" className="w-24 h-24 object-contain" />

            <div className="text-center flex-1">
              <h2 className="text-3xl font-bold text-gray-700">Application Details</h2>
            </div>         <div className="text-right">
              <table className="text-sm text-gray-700 border border-gray-300">
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="font-semibold pr-2 border-r border-gray-300 p-2">Date:</td>
                    <td className="p-2">{documentData.uploaded_at ? new Date(documentData.uploaded_at).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-2 border-r border-gray-300 p-2">Application ID:</td>
                    <td className="p-2">{documentData.application_id || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Horizontal Line */}
          <hr className="border-gray-400 mb-6" />

          {/* Category Header */}
          <h3 className="text-2xl font-bold text-gray-700 mb-4">
            Application for {documentData.category_name || 'N/A'}
          </h3>

          {/* Fields in Key-Value Format */}
          <table className="w-full border border-gray-300 mb-6">
            <tbody>
              {[{ label: "Application ID", value: documentData.application_id },
              // { label: "User ID", value: documentData.user_id },
              { label: "Category", value: documentData.category_name },
              { label: "Subcategory", value: documentData.subcategory_name },
              { label: "Name", value: documentData.name },
              { label: "Email", value: documentData.email },
              { label: "Phone", value: documentData.phone },
              { label: "Status", value: documentData.status },
                // { label: "Address", value: documentData.address },
                // { label: "Distributor", value: documentData.distributor_id || 'Not Assigned' }
              ].reduce((rows, field, index, array) => {
                if (index % 2 === 0) rows.push(array.slice(index, index + 2));
                return rows;
              }, []).map((pair, idx) => (
                <tr key={idx} className="border-b border-gray-300">
                  {pair.map((field, index) => (
                    <React.Fragment key={index}>
                      <td className="p-3 font-semibold border-r border-gray-300 w-1/6" style={{ backgroundColor: '#FFB4A2' }}>
                        {field.label}
                      </td>
                      <td className="p-3 border-r border-gray-300">{field.value || 'N/A'}</td>
                    </React.Fragment>
                  ))}
                  {pair.length < 2 && (
                    <>
                      <td className="p-3 border-r border-gray-300" style={{ backgroundColor: '#FFCDB2' }}></td>
                      <td className="p-3 border-r border-gray-300"></td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Document Fields Section */}
          <h3 className="text-2xl text-gray-700 font-semibold mb-4">Document Fields</h3>
          <table className="w-full table-fixed border border-gray-300">
            <tbody>
              {Object.entries(documentData.document_fields || {})
                .reduce((rows, field, index, array) => {
                  if (index % 2 === 0) rows.push(array.slice(index, index + 2));
                  return rows;
                }, [])
                .map((pair, idx) => (
                  <tr key={idx} className="border-b border-gray-300">
                    {pair.map(([key, value], index) => (
                      <React.Fragment key={index}>
                        <td className="w-1/5 p-3 font-semibold border-r border-gray-300 bg-white">{key}</td>
                        <td className="w-1/3 p-3 border-r border-gray-300">{value || 'N/A'}</td>
                      </React.Fragment>
                    ))}
                    {pair.length < 2 && (
                      <>
                        <td className="w-1/5 p-3 bg-white border-r border-gray-300"></td>
                        <td className="w-1/3 p-3 border-r border-gray-300"></td>
                      </>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApplicationView;
