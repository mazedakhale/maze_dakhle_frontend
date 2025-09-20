// eslint-disable-next-line no-unused-vars
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Registration from "./Components/Registration";
import Login from "./Components/Login";
import Admindashboard from "./Components/Admindashboard";
import Adashinner from "./Components/Adashinner";
import Addcategory from "./Components/Addcategory";
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
import Received from "./Components/Received";
import Dsentlist from "./Components/Dsentlist";
import Distributorrejected from "./Components/Distributorrejected";
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
function App() {
  return (
    <Router>
      <Routes>
        {/* Authentication */}
        <Route path="/" element={<MainPage />} />

        <Route path="/Login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/Registration" element={<Registration />} />
        <Route path="/Privacypolicy" element={<PrivacyPolicy />} />
        <Route path="/ContactForm" element={<ContactForm />} />
        <Route path="/RefundCancellationPolicy" element={<RefundCancellationPolicy />} />
        <Route path="/TermsAndConditions" element={<TermsAndConditions />} />
        <Route path="/Pricing" element={<Pricing />} />
        <Route path="/News" element={<News />} />

        {/* Admin Routes */}
        <Route path="/Admindashboard" element={<Admindashboard />} />
        <Route path="/Adashinner" element={<Admindashboard><Adashinner /></Admindashboard>} />
        <Route path="/ElistPage" element={<Admindashboard><ElistPage /></Admindashboard>} />
        <Route path="/Customerlist" element={<Admindashboard><Customerlist /></Admindashboard>} />
        <Route path="/Addcategory" element={<Admindashboard><Addcategory /></Admindashboard>} />
        <Route path="/Addsubcategory" element={<Admindashboard><Addsubcategory /></Admindashboard>} />
        <Route path="/Requireddocuments" element={<Admindashboard><RequiredDocuments /></Admindashboard>} />
        <Route path="/Price" element={<Admindashboard><Price /></Admindashboard>} />

        <Route path="/ContactTable" element={<Admindashboard><ContactTable /></Admindashboard>} />
        <Route path="/Contact" element={<Admindashboard><Contact /></Admindashboard>} />

        <Route path="/Documenttable" element={<Admindashboard><DocumentTable /></Admindashboard>} />
        <Route path="/Newstable" element={<Admindashboard><Newstable /></Admindashboard>} />
        <Route path="/HeaderTable" element={<Admindashboard><HeaderTable /></Admindashboard>} />
        <Route path="/ContactinfoTable" element={<Admindashboard><ContactinfoTable /></Admindashboard>} />

        <Route path="/Addfieldname" element={<Admindashboard><Addfieldname /></Admindashboard>} />
        <Route path="/Verifydocuments" element={<Admindashboard><Verifydocuments /></Admindashboard>} />
        <Route path="/Distributorlist" element={<Admindashboard><DistributorList /></Admindashboard>} />
        <Route path="/Employeelist" element={<Admindashboard><Employeelist /></Admindashboard>} />
        <Route path="/Employee" element={<Admindashboard><Employee /></Admindashboard>} />

        <Route path="/PrivacyPolicyTable" element={<Admindashboard><PrivacyPolicyTable /></Admindashboard>} />
        <Route path="/Youtube" element={<Admindashboard><Youtube /></Admindashboard>} />

        <Route path="/Distributorregister" element={<Admindashboard><Distributorregister /></Admindashboard>} />
        <Route path="/Recentapplications" element={<Admindashboard><Recentapplications /></Admindashboard>} />
        <Route path="/Userlist" element={<Admindashboard><Userlist /></Admindashboard>} />
        <Route path="/Distributorlistonly" element={<Admindashboard><Distributorlistonly /></Admindashboard>} />
        <Route path="/Addnotifications" element={<Admindashboard><Addnotifications /></Admindashboard>} />
        <Route path="/Adminrequest" element={<Admindashboard><Adminrequest /></Admindashboard>} />
        <Route path="/ReceiptErrorRequests" element={<Admindashboard><ReceiptErrorRequests /></Admindashboard>} />

        <Route path="/Adminerrorhistory" element={<Admindashboard><Adminerrorhistory /></Admindashboard>} />
        <Route path="/FeedbackList" element={<Admindashboard><FeedbackList /></Admindashboard>} />
        <Route path="/Verifydocumentshistory" element={<Admindashboard><Verifydocumentshistory /></Admindashboard>} />
        <Route path="/Assigndistributorlist" element={<Admindashboard><Assigndistributorlist /></Admindashboard>} />
        <Route path="/Uploadeddocuments" element={<Admindashboard><Uploadeddocuments /></Admindashboard>} />
        <Route path="/Rejecteddocuments" element={<Admindashboard><Rejecteddocuments /></Admindashboard>} />
        <Route path="/RejectedBefore" element={<Admindashboard><RejectedBefore /></Admindashboard>} />

        <Route path="/Lazycharts" element={<Admindashboard><LazyCharts /></Admindashboard>} />
        <Route path="/Received" element={<Admindashboard><Received /></Admindashboard>} />



        {/* Customer Routes */}
        <Route path="/Customerdashboard" element={<Customerdashboard />} />
        {/* Profile page */}
        <Route
          path="/ProfilePage"
          element={
            <Customerdashboard>
              <ProfilePage />
            </Customerdashboard>
          }
        />

        <Route path="/Cdashinner" element={<Customerdashboard><Cdashinner /></Customerdashboard>} />
        <Route path="/Userpendinglist" element={<Customerdashboard><Userpendinglist /></Customerdashboard>} />
        <Route path="/Usercompletedlist" element={<Customerdashboard><Usercompletedlist /></Customerdashboard>} />
        <Route path="/Customerapply" element={<Customerdashboard><Customerapply /></Customerdashboard>} />
        <Route path="/Feedback" element={<Customerdashboard><Feedback /></Customerdashboard>} />
        <Route path="/Guide" element={<Customerdashboard><Guide /></Customerdashboard>} />
        <Route path="/payment-status" element={<Customerdashboard><PaymentStatus /></Customerdashboard>} />
        <Route path="/payment-test" element={<Customerdashboard><PaymentTest /></Customerdashboard>} />
        <Route path="/PaymentButton" element={<Customerdashboard><PaymentButton /></Customerdashboard>} />
        <Route path="/TransactionTable" element={<Customerdashboard><TransactionTable /></Customerdashboard>} />

        <Route
          path="/wallet"
          element={
            <Customerdashboard>
              <Wallet />
            </Customerdashboard>
          }
        />

        <Route path="/Checkapplication" element={<Customerdashboard><Checkapplication /></Customerdashboard>} />
        <Route path="/Adderrorrequest" element={<Customerdashboard><Adderrorrequest /></Customerdashboard>} />
        {/* <Route path="/Addreceiptrequest" element={<Customerdashboard><Addreceiptrequest /></Customerdashboard>} /> */}

        <Route path="/Customerhistory" element={<Customerdashboard><Customerhistory /></Customerdashboard>} />
        <Route path="/Customererrorhistory" element={<Customerdashboard><Customererrorhistory /></Customerdashboard>} />
        <Route path="/Apply" element={<Customerdashboard><Apply /></Customerdashboard>} />
        <Route path="/Category" element={<Customerdashboard><Category /></Customerdashboard>} />
        <Route path="/Clistpage" element={<Customerdashboard><Clistpage /></Customerdashboard>} />
        <Route path="/Customerinvoice/:documentId" element={<Customerinvoice />} />
        <Route path="/Customerview/:documentId" element={<Customerview />} />

        {/* Distributor Routes */}
        <Route path="/Distributordashboard" element={<Distributordashboard />} />
        <Route path="/Ddashinner" element={<Distributordashboard><Ddashinner /></Distributordashboard>} />
        <Route path="/Distributorrequest" element={<Distributordashboard><Distributorrequest /></Distributordashboard>} />
        <Route path="/FeedbackD" element={<Distributordashboard><FeedbackD /></Distributordashboard>} />
        <Route path="/Distributorverify" element={<Distributordashboard><Distributorverify /></Distributordashboard>} />
        <Route path="/Distributorverifyhistory" element={<Distributordashboard><Distributorverifyhistory /></Distributordashboard>} />
        <Route path="/Dlistpage" element={<Distributordashboard><Dlistpage /></Distributordashboard>} />
        <Route path="/Distributorhistory" element={<Distributordashboard><Distributorhistory /></Distributordashboard>} />
        <Route path="/Dsentlist" element={<Distributordashboard><Dsentlist /></Distributordashboard>} />
        <Route path="/Distributorrejected" element={<Distributordashboard><Distributorrejected /></Distributordashboard>} />

        <Route path="/Distributorinvoice/:documentId" element={<Distributorinvoice />} />
        <Route path="/Distributorview/:documentId" element={<Distributorview />} />
        {/* Employee Routes */}

        <Route path="/Employeedashboard" element={<Employeedashboard />} />
        <Route path="/Edashinner" element={<Employeedashboard><Edashinner /></Employeedashboard>} />
        <Route path="/Emplist" element={<Employeedashboard><Emplist /></Employeedashboard>} />

        <Route path="/Employee" element={<Employeedashboard><Employee /></Employeedashboard>} />
        <Route path="/Spage" element={<Employeedashboard><Spage /></Employeedashboard>} />


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
