import { Routes, Route } from "react-router-dom";
import Login from './pages/Login'
import Sidebar from "./pages/Layout/Sidebar";
// import Sidebar from './components/Sidebar'
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AddCRP from "./pages/Admin/AddCRP";
import AllMembers from "./pages/Admin/AllMembers";
import AOS from 'aos';
import 'aos/dist/aos.css';
import MemberDetails from "./pages/Admin/MemberDetails";
import AddMember from "./pages/Crp/AddMember";
import AddGroup from "./pages/Crp/AddGroup"

AOS.init();

// import from "./pages/Admin/AdminDashboard";
function App() {

  return (
    <Routes>
      <Route path="/" element={<Login/>}/>
      {/* <Route path="/Sidebar" element={<Sidebar/>}/> */} 


      <Route path="admin/*" element={<Sidebar role="admin" />}>
          <Route path="AdminDashboard" element={<AdminDashboard />} />
          <Route path="add-crp" element={<AddCRP />} />
          <Route path="all-members" element={<AllMembers />} />
          {/*<Route path="group-members" element={<GroupMembers />} />
          <Route path="approval-list" element={<ApprovalList />} />
          <Route path="approved-list" element={<ApprovedList />} /> */}
          <Route path="member/:id" element={<MemberDetails />} />
        </Route>

        <Route path="crp/*" element={<Sidebar role="crp" />}>
        <Route path="Add-members" element={<AddMember/>}/>
        <Route path="Add-groups" element={<AddGroup/>}/>
          {/* <Route path="home" element={<CrpHome />} />
          <Route path="all-members" element={<AllMembers />} />
          <Route path="group-members" element={<GroupMembers />} />
          <Route path="approval-list" element={<ApprovalList />} />
          <Route path="approved-list" element={<ApprovedList />} /> */}
        </Route>
    </Routes>

  )
}

export default App
