// eslint-disable-next-line no-unused-vars
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Registration from "./Components/Registration";
import Login from "./Components/Login";
import Admindashboard from './Components/Admindashboard';
import Adashinner from './Components/Adashinner';
import Addcategory from './Components/Addcategory';
import Addsubcategory from './Components/Addsubcategory';
import RequiredDocuments from './Components/RequiredDocuments';
import DocumentTable from './Components/DocumentTable';
import Distributordashboard from './Components/Distributordashboard';
import Ddashinner from './Components/Ddashinner';
import Customerdashboard from './Components/Customerdashboard';
import AssignedDistributorsList from "./Components/Assigndistributorlist";
// import Home from './Components/Home';
// import About from './Components/About';
// import Contact from './Components/Contact';
import Apply from './Components/Apply';
import ElistPage from './Components/ElistPage '
import Category from './Components/Category';
// import "./style.css";
import './App.css'
import Verifydocuments from './Components/Verifydocuments';
import DistributorList from "./Components/Distributorlist";
import Distributorregister from "./Components/Distributorregister";
import Distributorverify from './Components/Distributorverify';
import Customerapply from './Components/Customerapply';
// import Custsidebar from "./Components/Customerdashboard";
import Cdashinner from "./Components/Cdashinner";

import Addfieldname from './Components/Addfieldname';
import Recentapplications from "./Components/Recentapplications";
import Dlistpage from './Components/Dlistpage';
import Userpendinglist from './Components/Userpendinglist';
import Usercompletedlist from './Components/Usercompletedlist';
import Checkapplication from './Components/Checkapplication';
import Invoice from './Components/Invoice';
import View from './Components/View';
import Userlist from './Components/Userlist';
import Distributorlistonly from './Components/Distributorlistonly';
import Addnotifications from './Components/Addnotifications';
import Clistpage from './Components/Clistpage';
import Adderrorrequest from './Components/Adderrorrequest';
import Customerhistory from './Components/Customerhistory';
import Adminrequest from './Components/Adminrequest';
import Distributorrequest from './Components/Distributorrequest';
import Distributorinvoice from './Components/Distributorinvoice';
import Distributorview from './Components/Distributorview';
import Distributorhistory from './Components/Distributorhistory';
import Distributorverifyhistory from './Components/Distributorverifyhistory';
import Customererrorhistory from './Components/Customererrorhistory';
import Customerinvoice from './Components/Customerinvoice';
import Customerview from './Components/Customerview';
import Adminerrorhistory from './Components/Adminerrorhistory';
import Verifydocumentshistory from './Components/Verifydocumentshistory';
import Registerdocument from './Components/Registerdocument';
import Customerlist from './Components/Customerlist';
import Feedback from './Components/Feedback';
import FeedbackList from './Components/FeedbackList'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/Registration" element={<Registration />} />
        <Route path="/Invoice/:documentId" element={<Invoice />} />
        <Route path="/Registerdocument/:id/:role" element={<Registerdocument />} />

        <Route path="/" element={<Login />} />
        <Route path="/View/:documentId" element={<View />} />
        <Route path="/Admindashboard" element={<Admindashboard />} />
        <Route path="/Adashinner" element={<Admindashboard><Adashinner /></Admindashboard>} />
        <Route path="/ElistPage" element={<Admindashboard><ElistPage /></Admindashboard>} />
        <Route path="/Customerlist" element={<Admindashboard><Customerlist /></Admindashboard>} />
        <Route path="/Addcategory" element={<Admindashboard><Addcategory /></Admindashboard>} />
        <Route path="/Addsubcategory" element={<Admindashboard><Addsubcategory /></Admindashboard>} />
        <Route path="/requireddocuments" element={<Admindashboard><RequiredDocuments /></Admindashboard>} />
        <Route path="/documenttable" element={<Admindashboard><DocumentTable /></Admindashboard>} />
        <Route path="/Addfieldname" element={<Admindashboard><Addfieldname /></Admindashboard>} />
        <Route path="/Verifydocuments" element={<Admindashboard><Verifydocuments /></Admindashboard>} />
        <Route path="/distributorlist" element={<Admindashboard><DistributorList /></Admindashboard>} />
        <Route path="/Distributorregister" element={<Admindashboard><Distributorregister /></Admindashboard>} />
        <Route path="/Recentapplications" element={<Admindashboard><Recentapplications /></Admindashboard>} />
        <Route path="/Userlist" element={<Admindashboard><Userlist /></Admindashboard>} />
        <Route path="/Distributorlistonly" element={<Admindashboard><Distributorlistonly /></Admindashboard>} />
        <Route path="/Addnotifications" element={<Admindashboard><Addnotifications /></Admindashboard>} />
        <Route path="/Adminrequest" element={<Admindashboard><Adminrequest /></Admindashboard>} />
        <Route path="/Adminerrorhistory" element={<Admindashboard><Adminerrorhistory /></Admindashboard>} />
        <Route path="/FeedbackList" element={<Admindashboard><FeedbackList /></Admindashboard>} />

        <Route path="/Verifydocumentshistory" element={<Admindashboard><Verifydocumentshistory /></Admindashboard>} />
        <Route path="/AssignedDistributorsList" element={<Admindashboard><AssignedDistributorsList></AssignedDistributorsList></Admindashboard>} />


        <Route path="/Customerdashboard" element={<Customerdashboard />} />
        <Route path="/Cdashinner" element={<Customerdashboard><Cdashinner /></Customerdashboard>} />

        <Route path="/Userpendinglist" element={<Customerdashboard><Userpendinglist /></Customerdashboard>} />
        <Route path="/Usercompletedlist" element={<Customerdashboard><Usercompletedlist /></Customerdashboard>} />
        <Route path="/Customerapply" element={<Customerdashboard><Customerapply /></Customerdashboard>} />
        <Route path="/Feedback" element={<Customerdashboard><Feedback /></Customerdashboard>} />

        <Route path="/Checkapplication" element={<Customerdashboard><Checkapplication /></Customerdashboard>} />
        <Route path="/Adderrorrequest" element={<Customerdashboard><Adderrorrequest /></Customerdashboard>} />
        <Route path="/Customerhistory" element={<Customerdashboard><Customerhistory /></Customerdashboard>} />
        <Route path="/Customererrorhistory" element={<Customerdashboard><Customererrorhistory /></Customerdashboard>} />
        <Route path="/Apply" element={<Customerdashboard><Apply /></Customerdashboard>} />
        <Route path="/Category" element={<Customerdashboard><Category /></Customerdashboard>} />

        <Route path="/Clistpage" element={<Customerdashboard><Clistpage /></Customerdashboard>} />
        <Route path="/Customerinvoice/:documentId" element={<Customerinvoice />} />
        <Route path="/Customerview/:documentId" element={<Customerview />} />
        <Route path="/Distributordashboard" element={<Distributordashboard />} />
        <Route path="/Ddashinner" element={<Distributordashboard><Ddashinner /></Distributordashboard>} />
        <Route path="/Distributorrequest" element={<Distributordashboard><Distributorrequest /></Distributordashboard>} />
        <Route path="/Feedback" element={<Distributordashboard><Feedback /></Distributordashboard>} />

        <Route path="/Distributorverify" element={<Distributordashboard><Distributorverify /></Distributordashboard>} />
        <Route path="/Distributorverifyhistory" element={<Distributordashboard><Distributorverifyhistory /></Distributordashboard>} />


        <Route path="/Dlistpage" element={<Distributordashboard><Dlistpage /></Distributordashboard>} />
        <Route path="/Distributorhistory" element={<Distributordashboard><Distributorhistory /></Distributordashboard>} />
        <Route path="/Distributorinvoice/:documentId" element={<Distributorinvoice />} />
        <Route path="/Distributorview/:documentId" element={<Distributorview />} />

      </Routes>
    </Router>
  );
}

export default App