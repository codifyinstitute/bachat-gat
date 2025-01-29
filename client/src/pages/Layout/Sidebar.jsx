import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { UserPlus, Users, List, CheckCircle, Menu, X } from "lucide-react";
import logo from '../../assets/Images/logo.png';

const Sidebar = ({ role }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Define links based on roles
  const links = {
    admin: [
      { name: "Dashboard", path: "/admin/AdminDashboard", icon: <Users /> },
      { name: "Add CRP", path: "/admin/add-crp", icon: <UserPlus /> },
      { name: "All Members", path: "/admin/all-members", icon: <Users /> },
      { name: "Group-wise Members", path: "/admin/groups", icon: <List /> },
      { name: "Approval List", path: "/admin/approval-list", icon: <CheckCircle /> },
      { name: "Approved List", path: "/admin/approved-list", icon: <CheckCircle /> },
    ],
    crp: [
      { name: "Home", path: "/crp/home", icon: <Users /> },
      { name: "All Members", path: "/crp/Crp-members", icon: <Users /> },
      { name: "Add Members", path: "/crp/add-members", icon: <UserPlus /> },
      { name: "Add Groups", path: "/crp/add-groups", icon: <UserPlus /> },
      { name: "Loan Sanction", path: "/crp/Crp-loansanction", icon: <CheckCircle /> },
      { name: "Approved List", path: "/crp/approved-list", icon: <CheckCircle /> },
    ],
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Toggle Button */}
      <div className=" absolute flex justify-end p-4 w-full">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className=" top-4 left-65 z-15 p-2 bg-gray-800 text-white rounded-md md:hidden"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-white text-gray-800 z-10 md:static flex-shrink-0 min-h-screen`}
      >
        <div className="p-4 text-lg font-bold border-b border-gray-700 flex gap-4 items-center">
          <img src={logo} alt="Logo" className="h-10 w-15 rounded-md" />
          {role.toUpperCase()} Panel
        </div>
        <nav className="mt-4">
          {links[role]?.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-md ${
                  isActive ? "bg-gray-300" : "hover:bg-gray-200"
                }`
              }
              onClick={() => setIsOpen(false)} // Close sidebar on mobile link click
            >
              {link.icon}
              {link.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
};

export default Sidebar;
