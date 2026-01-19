// eslint-disable-next-line no-unused-vars
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import ProtectedRoute from "./Components/ProtectedRoute";
import AutoRedirect from "./Components/AutoRedirect";
import jwtDecode from "jwt-decode";
import Registration from "./Components/Registration";
import Login from "./Components/Login";
import Admindashboard from "./Components/Admindashboard";
import Adashinner from "./Components/Adashinner";
import Addcategory from "./Components/Addcategory";
import AddImpDoc from "./Components/AddImpDoc";
import ViewImpDoc from "./Components/ViewImpDoc";
import Addsubcategory from "./Components/Addsubcategory";
import RequiredDocuments from "./Components/RequiredDocuments";
import DocumentTable from "./Components/DocumentTable";
import Distributordashboard from "./Components/Distributordashboard";
import Ddashinner from "./Components/Ddashinner";
import Customerdashboard from "./Components/Customerdashboard";
import Assigndistributorlist from "./Components/Assigndistributorlist";
import Apply from "./Components/Apply";
import ElistPage from "./Components/ElistPage";
import Category from "./Components/Category";
import Verifydocuments from "./Components/Verifydocuments";
import DistributorList from "./Components/Distributorlist";
import Distributorregister from "./Components/Distributorregister";
import Distributorverify from "./Components/Distributorverify";
import Customerapply from "./Components/Customerapply";
import Cdashinner from "./Components/Cdashinner";
import Addfieldname from "./Components/Addfieldname";
import Recentapplications from "./Components/Recentapplications";
import Dlistpage from "./Components/Dlistpage";
import Userpendinglist from "./Components/Userpendinglist";
import Usercompletedlist from "./Components/Usercompletedlist";
import Checkapplication from "./Components/Checkapplication";
import Invoice from "./Components/Invoice";
import View from "./Components/View";
import Userlist from "./Components/Userlist";
import Distributorlistonly from "./Components/Distributorlistonly";
import Addnotifications from "./Components/Addnotifications";
import Clistpage from "./Components/Clistpage";
import Adderrorrequest from "./Components/Adderrorrequest";
import Customerhistory from "./Components/Customerhistory";
import Adminrequest from "./Components/Adminrequest";
import Distributorrequest from "./Components/Distributorrequest";
import Distributorinvoice from "./Components/Distributorinvoice";
import Distributorview from "./Components/Distributorview";
import Distributorhistory from "./Components/Distributorhistory";
import Distributorverifyhistory from "./Components/Distributorverifyhistory";
import Customererrorhistory from "./Components/Customererrorhistory";
import Customerinvoice from "./Components/Customerinvoice";
import Customerview from "./Components/Customerview";
import Adminerrorhistory from "./Components/Adminerrorhistory";
import Verifydocumentshistory from "./Components/Verifydocumentshistory";
import Registerdocument from "./Components/Registerdocument";
import Customerlist from "./Components/Customerlist";
import Feedback from "./Components/Feedback";
import FeedbackD from "./Components/FeedbackD";
// import Addreceiptrequest from "./Components/Addreceiptrequest"
import FeedbackList from "./Components/FeedbackList";
import Uploadeddocuments from "./Components/Uploadeddocuments";
import Rejecteddocuments from "./Components/Rejecteddocuments";
import Employeelist from "./Components/Employeelist"
import "./App.css";
import LazyCharts from "./Components/Lazycharts";
import Price from "./Components/Price";
import Edashinner from "./Components/Edashinner";
import Employeedashboard from "./Components/Employeedashboard";
import Employee from "./Components/Employee";
import Spage from "./Components/EmployeeDocumentList"
import EmployeeReceiptList from "./Components/EmployeeReceiptList";
import EmployeeCertificateList from "./Components/EmployeeCertificateList";
import Received from "./Components/Received";
import Dsentlist from "./Components/Dsentlist";
import Distributorrejected from "./Components/Distributorrejected";
import PaymentRequest from "./Components/PaymentRequest";
import Emplist from "./Components/Emplist";
import MainPage from "./Components/Mainpage";
import PrivacyPolicy from "./Components/Privacypolicy";
import PrivacyPolicyTable from "./Components/PrivacyPolicyTable";
import ContactTable from "./Components/ContactTable";
import ContactForm from "./Components/ContactForm";
import ProfilePage from "./Components/ProfilePage";
import Youtube from "./Components/Youtube";
import Guide from "./Components/Guide"
import Contact from "./Components/Contact"
import RejectedBefore from "./Components/RejectedBefore"
import ReceiptErrorRequests from "./Components/ReceiptErrorRequests"
import RefundCancellationPolicy from "./Components/RefundCancellationPolicy"
import TermsAndConditions from "./Components/TermsAndConditions"
import Pricing from "./Components/Pricing";
import Newstable from "./Components/Newstable"
import News from "./Components/News"
import ResetPassword from "./Components/ResetPassword";
import HeaderTable from "./Components/HeaderTable"
import ContactinfoTable from "./Components/ContactinfoTable"
import PaymentButton from "./Components/PaymentButton";
import PaymentStatus from "./Components/PaymentStatus";
import PaymentTest from "./Components/PaymentTest";
import Wallet from "./Components/Wallet";
import TransactionTable from "./Components/TransactionTable";
import api from "./utils/api";
import TransactionHistory from "./Components/TransactionHistory";
import DistributorPaymentRequest from "./Components/DistributorPaymentRequest";
import AdminWallet from "./Components/AdminWallet";
import AdminDeletionCodeSettings from "./Components/AdminDeletionCodeSettings";
import EmployeeRecentApplications from "./Components/EmployeeRecentApplications";
import DistributorCommissions from "./Components/DistributorCommissions";
import DistributorCommissionView from "./Components/DistributorCommissionView";
import DistributorPaymentDetails from "./Components/DistributorPaymentDetails";
import DistributorPaymentHistory from "./Components/DistributorPaymentHistory";
// import DistributorPaymentAnalytics from "./Components/DistributorPaymentAnalytics";

function App() {
  return (
    <Router>
      <Routes>
        {/* Authentication */}
        <Route path="/" element={<AutoRedirect><MainPage /></AutoRedirect>} />

        <Route path="/Login" element={<AutoRedirect><Login /></AutoRedirect>} />
        <Route path="/reset-password" element={<AutoRedirect><ResetPassword /></AutoRedirect>} />

        <Route path="/Registration" element={<AutoRedirect><Registration /></AutoRedirect>} />
        <Route path="/Privacypolicy" element={<PrivacyPolicy />} />
        <Route path="/ContactForm" element={<ContactForm />} />
        <Route path="/RefundCancellationPolicy" element={<RefundCancellationPolicy />} />
        <Route path="/TermsAndConditions" element={<TermsAndConditions />} />
        <Route path="/Pricing" element={<Pricing />} />
        <Route path="/News" element={<News />} />

        {/* Admin Routes */}
        <Route path="/Admindashboard" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard /></ProtectedRoute>} />
        <Route path="/Adashinner" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><Adashinner /></Admindashboard></ProtectedRoute>} />
        <Route path="/ElistPage" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><ElistPage /></Admindashboard></ProtectedRoute>} />
        <Route path="/Customerlist" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><Customerlist /></Admindashboard></ProtectedRoute>} />
        <Route path="/Addcategory" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><Addcategory /></Admindashboard></ProtectedRoute>} />
        <Route path="/AddImpDoc" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><AddImpDoc /></Admindashboard></ProtectedRoute>} />
        <Route path="/Addsubcategory" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><Addsubcategory /></Admindashboard></ProtectedRoute>} />
        <Route path="/Requireddocuments" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><RequiredDocuments /></Admindashboard></ProtectedRoute>} />
        <Route path="/Price" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><Price /></Admindashboard></ProtectedRoute>} />

        <Route path="/ContactTable" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><ContactTable /></Admindashboard></ProtectedRoute>} />
        <Route path="/Contact" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><Contact /></Admindashboard></ProtectedRoute>} />

        <Route path="/Documenttable" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><DocumentTable /></Admindashboard></ProtectedRoute>} />
        <Route path="/Newstable" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><Newstable /></Admindashboard></ProtectedRoute>} />
        <Route path="/HeaderTable" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><HeaderTable /></Admindashboard></ProtectedRoute>} />
        <Route path="/ContactinfoTable" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><ContactinfoTable /></Admindashboard></ProtectedRoute>} />

        <Route path="/Addfieldname" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><Addfieldname /></Admindashboard></ProtectedRoute>} />
        <Route path="/Verifydocuments" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><Verifydocuments /></Admindashboard></ProtectedRoute>} />
        <Route path="/Distributorlist" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><DistributorList /></Admindashboard></ProtectedRoute>} />
        <Route path="/Employeelist" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><Employeelist /></Admindashboard></ProtectedRoute>} />
        <Route path="/Employee" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><Employee /></Admindashboard></ProtectedRoute>} />

        <Route path="/PrivacyPolicyTable" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><PrivacyPolicyTable /></Admindashboard></ProtectedRoute>} />
        <Route path="/Youtube" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><Youtube /></Admindashboard></ProtectedRoute>} />

        <Route path="/Distributorregister" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><Distributorregister /></Admindashboard></ProtectedRoute>} />
        <Route path="/Recentapplications" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><Recentapplications /></Admindashboard></ProtectedRoute>} />
        <Route path="/Userlist" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><Userlist /></Admindashboard></ProtectedRoute>} />
        <Route path="/Distributorlistonly" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><Distributorlistonly /></Admindashboard></ProtectedRoute>} />
        <Route path="/Addnotifications" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><Addnotifications /></Admindashboard></ProtectedRoute>} />
        <Route path="/Adminrequest" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><Adminrequest /></Admindashboard></ProtectedRoute>} />
        <Route path="/ReceiptErrorRequests" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><ReceiptErrorRequests /></Admindashboard></ProtectedRoute>} />

        <Route path="/Adminerrorhistory" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><Adminerrorhistory /></Admindashboard></ProtectedRoute>} />
        <Route path="/FeedbackList" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><FeedbackList /></Admindashboard></ProtectedRoute>} />
        <Route path="/Verifydocumentshistory" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><Verifydocumentshistory /></Admindashboard></ProtectedRoute>} />
        <Route path="/Assigndistributorlist" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><Assigndistributorlist /></Admindashboard></ProtectedRoute>} />
        <Route path="/Uploadeddocuments" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><Uploadeddocuments /></Admindashboard></ProtectedRoute>} />
        <Route path="/Rejecteddocuments" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><Rejecteddocuments /></Admindashboard></ProtectedRoute>} />
        <Route path="/RejectedBefore" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><RejectedBefore /></Admindashboard></ProtectedRoute>} />
        <Route path="/CustomerTransactions" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><TransactionHistory /></Admindashboard></ProtectedRoute>} />
        <Route path="/DistributorPaymentRequest" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><DistributorPaymentRequest /></Admindashboard></ProtectedRoute>} />
        <Route path="/AdminWallet" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><AdminWallet /></Admindashboard></ProtectedRoute>} />
        <Route path="/AdminDeletionCodeSettings" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><AdminDeletionCodeSettings /></Admindashboard></ProtectedRoute>} />
        <Route path="/DistributorCommissions" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><DistributorCommissions /></Admindashboard></ProtectedRoute>} />

        <Route path="/Lazycharts" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><LazyCharts /></Admindashboard></ProtectedRoute>} />
        <Route path="/Received" element={<ProtectedRoute allowedRoles={['Admin']}><Admindashboard><Received /></Admindashboard></ProtectedRoute>} />




        {/* Customer Routes */}
        <Route path="/Customerdashboard" element={<ProtectedRoute allowedRoles={['Customer']}><Customerdashboard /></ProtectedRoute>} />
        {/* Profile page */}
        <Route
          path="/ProfilePage"
          element={
            <ProtectedRoute allowedRoles={['Customer']}>
              <Customerdashboard>
                <ProfilePage />
              </Customerdashboard>
            </ProtectedRoute>
          }
        />

        <Route path="/Cdashinner" element={<ProtectedRoute allowedRoles={['Customer']}><Customerdashboard><Cdashinner /></Customerdashboard></ProtectedRoute>} />
        <Route path="/Userpendinglist" element={<ProtectedRoute allowedRoles={['Customer']}><Customerdashboard><Userpendinglist /></Customerdashboard></ProtectedRoute>} />
        <Route path="/Usercompletedlist" element={<ProtectedRoute allowedRoles={['Customer']}><Customerdashboard><Usercompletedlist /></Customerdashboard></ProtectedRoute>} />
        <Route path="/Customerapply" element={<ProtectedRoute allowedRoles={['Customer']}><Customerdashboard><Customerapply /></Customerdashboard></ProtectedRoute>} />
        <Route path="/Feedback" element={<ProtectedRoute allowedRoles={['Customer']}><Customerdashboard><Feedback /></Customerdashboard></ProtectedRoute>} />
        <Route path="/Guide" element={<ProtectedRoute allowedRoles={['Customer']}><Customerdashboard><Guide /></Customerdashboard></ProtectedRoute>} />
        <Route path="/payment-status" element={<ProtectedRoute allowedRoles={['Customer']}><Customerdashboard><PaymentStatus /></Customerdashboard></ProtectedRoute>} />
        <Route path="/payment-test" element={<ProtectedRoute allowedRoles={['Customer']}><Customerdashboard><PaymentTest /></Customerdashboard></ProtectedRoute>} />
        <Route path="/PaymentButton" element={<ProtectedRoute allowedRoles={['Customer']}><Customerdashboard><PaymentButton /></Customerdashboard></ProtectedRoute>} />
        <Route path="/TransactionTable" element={<ProtectedRoute allowedRoles={['Customer']}><Customerdashboard><TransactionTable /></Customerdashboard></ProtectedRoute>} />

        <Route
          path="/wallet"
          element={
            <ProtectedRoute allowedRoles={['Customer']}>
              <Customerdashboard>
                <Wallet />
              </Customerdashboard>
            </ProtectedRoute>
          }
        />

        <Route path="/Checkapplication" element={<ProtectedRoute allowedRoles={['Customer']}><Customerdashboard><Checkapplication /></Customerdashboard></ProtectedRoute>} />
        <Route path="/Adderrorrequest" element={<ProtectedRoute allowedRoles={['Customer']}><Customerdashboard><Adderrorrequest /></Customerdashboard></ProtectedRoute>} />
        {/* <Route path="/Addreceiptrequest" element={<ProtectedRoute allowedRoles={['Customer']}><Customerdashboard><Addreceiptrequest /></Customerdashboard></ProtectedRoute>} /> */}

        <Route path="/Customerhistory" element={<ProtectedRoute allowedRoles={['Customer']}><Customerdashboard><Customerhistory /></Customerdashboard></ProtectedRoute>} />
        <Route path="/Customererrorhistory" element={<ProtectedRoute allowedRoles={['Customer']}><Customerdashboard><Customererrorhistory /></Customerdashboard></ProtectedRoute>} />
        <Route path="/Apply" element={<ProtectedRoute allowedRoles={['Customer']}><Customerdashboard><Apply /></Customerdashboard></ProtectedRoute>} />
        <Route path="/Category" element={<ProtectedRoute allowedRoles={['Customer']}><Customerdashboard><Category /></Customerdashboard></ProtectedRoute>} />
        <Route path="/Clistpage" element={<ProtectedRoute allowedRoles={['Customer']}><Customerdashboard><Clistpage /></Customerdashboard></ProtectedRoute>} />
        <Route path="/Customerinvoice/:documentId" element={<ProtectedRoute allowedRoles={['Customer']}><Customerinvoice /></ProtectedRoute>} />
        <Route path="/Customerview/:documentId" element={<ProtectedRoute allowedRoles={['Customer']}><Customerview /></ProtectedRoute>} />

        {/* Distributor Routes */}
        <Route path="/Distributordashboard" element={<ProtectedRoute allowedRoles={['Distributor']}><Distributordashboard /></ProtectedRoute>} />
        <Route path="/Ddashinner" element={<ProtectedRoute allowedRoles={['Distributor']}><Distributordashboard><Ddashinner /></Distributordashboard></ProtectedRoute>} />
        <Route path="/Distributorrequest" element={<ProtectedRoute allowedRoles={['Distributor']}><Distributordashboard><Distributorrequest /></Distributordashboard></ProtectedRoute>} />
        <Route path="/FeedbackD" element={<ProtectedRoute allowedRoles={['Distributor']}><Distributordashboard><FeedbackD /></Distributordashboard></ProtectedRoute>} />
        <Route path="/Distributorverify" element={<ProtectedRoute allowedRoles={['Distributor']}><Distributordashboard><Distributorverify /></Distributordashboard></ProtectedRoute>} />
        <Route path="/Distributorverifyhistory" element={<ProtectedRoute allowedRoles={['Distributor']}><Distributordashboard><Distributorverifyhistory /></Distributordashboard></ProtectedRoute>} />
        <Route path="/Dlistpage" element={<ProtectedRoute allowedRoles={['Distributor']}><Distributordashboard><Dlistpage /></Distributordashboard></ProtectedRoute>} />
        <Route path="/Distributorhistory" element={<ProtectedRoute allowedRoles={['Distributor']}><Distributordashboard><Distributorhistory /></Distributordashboard></ProtectedRoute>} />
        <Route path="/Dsentlist" element={<ProtectedRoute allowedRoles={['Distributor']}><Distributordashboard><Dsentlist /></Distributordashboard></ProtectedRoute>} />
        <Route path="/Distributorrejected" element={<ProtectedRoute allowedRoles={['Distributor']}><Distributordashboard><Distributorrejected /></Distributordashboard></ProtectedRoute>} />
        <Route path="/PaymentRequest" element={<ProtectedRoute allowedRoles={['Distributor']}><Distributordashboard><PaymentRequest /></Distributordashboard></ProtectedRoute>} />
        <Route path="/PaymentHistory" element={<ProtectedRoute allowedRoles={['Distributor']}><Distributordashboard><DistributorPaymentHistory /></Distributordashboard></ProtectedRoute>} />
        {/* <Route path="/PaymentAnalytics" element={<ProtectedRoute allowedRoles={['Distributor']}><Distributordashboard><DistributorPaymentAnalytics /></Distributordashboard></ProtectedRoute>} /> */}
        <Route path="/MyCommissions" element={<ProtectedRoute allowedRoles={['Distributor']}><Distributordashboard><DistributorCommissionView /></Distributordashboard></ProtectedRoute>} />
        <Route path="/PaymentDetails" element={<ProtectedRoute allowedRoles={['Distributor']}><Distributordashboard><DistributorPaymentDetails /></Distributordashboard></ProtectedRoute>} />
        <Route path="/ViewImpDocD" element={<ProtectedRoute allowedRoles={['Distributor']}><Distributordashboard><ViewImpDoc /></Distributordashboard></ProtectedRoute>} />

        <Route path="/Distributorinvoice/:documentId" element={<ProtectedRoute allowedRoles={['Distributor']}><Distributorinvoice /></ProtectedRoute>} />
        <Route path="/Distributorview/:documentId" element={<ProtectedRoute allowedRoles={['Distributor']}><Distributorview /></ProtectedRoute>} />
        {/* Employee Routes */}

        <Route path="/Employeedashboard" element={<ProtectedRoute allowedRoles={['Employee']}><Employeedashboard /></ProtectedRoute>} />
        <Route path="/Edashinner" element={<ProtectedRoute allowedRoles={['Employee']}><Employeedashboard><Edashinner /></Employeedashboard></ProtectedRoute>} />
        <Route path="/Emplist" element={<ProtectedRoute allowedRoles={['Employee']}><Employeedashboard><Emplist /></Employeedashboard></ProtectedRoute>} />
        <Route path="/ViewImpDocE" element={<ProtectedRoute allowedRoles={['Employee']}><Employeedashboard><ViewImpDoc /></Employeedashboard></ProtectedRoute>} />

        <Route path="/Employee" element={<ProtectedRoute allowedRoles={['Employee']}><Employeedashboard><Employee /></Employeedashboard></ProtectedRoute>} />
        <Route path="/EmployeeRecent" element={<ProtectedRoute allowedRoles={['Employee']}><Employeedashboard><EmployeeRecentApplications/></Employeedashboard></ProtectedRoute>} />
        <Route path="/Spage" element={<ProtectedRoute allowedRoles={['Employee']}><Employeedashboard><Spage /></Employeedashboard></ProtectedRoute>} />
        <Route path="/EmployeeReceiptList" element={<ProtectedRoute allowedRoles={['Employee']}><Employeedashboard><EmployeeReceiptList /></Employeedashboard></ProtectedRoute>} />
        <Route path="/EmployeeCertificateList" element={<ProtectedRoute allowedRoles={['Employee']}><Employeedashboard><EmployeeCertificateList /></Employeedashboard></ProtectedRoute>} />


        {/* Invoice & Document Routes */}
        <Route path="/Invoice/:documentId" element={<Invoice />} />
        <Route path="/View/:documentId" element={<View />} />
        <Route path="/Registerdocument/:id/:role" element={<Registerdocument />} />
      </Routes>
    </Router>
  );
}

export default App;

//backup before solving main and subcategory issue
