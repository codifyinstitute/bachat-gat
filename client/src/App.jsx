import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Sidebar from "./pages/Layout/Sidebar";
// import Sidebar from './components/Sidebar'
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AddCRP from "./pages/Admin/AddCRP";
import AllMembers from "./pages/Admin/AllMembers";
import AOS from "aos";
import "aos/dist/aos.css";
import MemberDetails from "./pages/Admin/MemberDetails";
import AddMember from "./pages/Crp/AddMember";
import AddGroup from "./pages/Crp/AddGroup";
// import Allmembers from "./pages/Crp/MemberList"
import CrpMembers from "./pages/Crp/CrpMembers";
import CrpMemdetails from "./pages/Crp/CrpMemdetails";
import Groups from "./pages/Admin/Groups";
import LoanSanctionForm from "./pages/Crp/LoanSanctionForm";
import ApprovalList from "./pages/Admin/Approvallist";
import PendingLoans from "./pages/Crp/PendingLoans";
import ApprovedList from "./pages/Admin/ApprovedList";
import Collection from "./pages/Crp/Collection";
import CrpApprovedlist from "./pages/Crp/CrpApprovedlist";
// import Payment from "./pages/Crp/Payment";
import PaymentPage from "./pages/Crp/PaymentPage";
import GroupByCrp from "./pages/Crp/GroupByCrp";
import ApproveCollection from "./pages/Admin/ApproveCollection";
import Crpdashboard from "./pages/Crp/Crpdashboard";
import AddBank from "./pages/Admin/AddBank";
import AllCRP from "./pages/Admin/AllCRP";
import Forclose from "./pages/Crp/Forclose"

AOS.init();

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      {/* <Route path="/Sidebar" element={<Sidebar/>}/> */}

      <Route path="admin/*" element={<Sidebar role="admin" />}>
        <Route path="AdminDashboard" element={<AdminDashboard />} />
        <Route path="add-crp" element={<AddCRP />} />
        <Route path="all-crp" element={<AllCRP />} />
        <Route path="all-members" element={<AllMembers />} />
        <Route path="groups" element={<Groups />} />
        <Route path="member/:id" element={<MemberDetails />} />
        <Route path="approvallist" element={<ApprovalList />} />
        <Route path="approvedlist" element={<ApprovedList />} />
        <Route path="approvecollection" element={<ApproveCollection/>}/>
        <Route path="addbank" element={<AddBank/>}/>
      </Route>

      <Route path="crp/*" element={<Sidebar role="crp" />}>
        <Route path="Add-members" element={<AddMember />} />
        <Route path="Add-groups" element={<AddGroup />} />
        <Route path="Crp-members" element={<CrpMembers />} />
        <Route path="Crp-memdetails/:id" element={<CrpMemdetails />} />
        <Route path="Crp-loansanction" element={<LoanSanctionForm />} />
        <Route path="pending-loans" element={<PendingLoans />} />
        <Route path="collection" element={<Collection />} />
        <Route path="crpapprovedlist" element={<CrpApprovedlist />} />
        {/* <Route path="payment" element={<Payment />} /> */}
        <Route path="paymentPage" element={<PaymentPage />} />
        <Route path="GroupByCrp" element={<GroupByCrp />} />
        <Route path="CrpHome" element={<Crpdashboard />} />
        <Route path="Crpforclose" element={<Forclose />} />
      </Route>
    </Routes>
  );
}

export default App;
