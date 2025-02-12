import React, { useEffect, useState } from "react";
import axios from "axios"; // Import axios
import "aos/dist/aos.css";
import { useNavigate } from "react-router-dom";

const AllCRP = () => {
  const navigate = useNavigate(); // Get navigate function
  const [members, setMembers] = useState([]); // State to store fetched members
  const [error, setError] = useState(null); // State to store any error
  const [searchTerm, setSearchTerm] = useState(""); // State to store search term
  const [filteredMembers, setFilteredMembers] = useState([]); // State to store filtered members

  // Assuming the admin_token is stored in localStorage
  const adminToken = localStorage.getItem("admin_token");
  console.log("Admin Token:", adminToken);

  useEffect(() => {
    // Fetch members data from backend API
    const fetchMembers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/crp/allcrp", {
          headers: {
            Authorization: `Bearer ${adminToken}`, // Pass the token in the Authorization header
          },
        });
        console.log("API Response:", response.data);

        if (!response.data || !response.data.crps) {
          setError("The response data is not in the expected format.");
        } else {
          const sortedCrps = response.data.crps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by most recent first
          setMembers(sortedCrps); // Extract the 'crps' array
          setFilteredMembers(sortedCrps); // Set the filtered list as well
        }
      } catch (err) {
        setError("Failed to fetch members data.");
        console.error(err);
      }
    };

    fetchMembers();
  }, [adminToken]);

  // Filter members based on the search term
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredMembers(members); // If the search term is empty, show all members
    } else {
      setFilteredMembers(
        members.filter((member) =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) // Search by member name
        )
      );
    }
  }, [searchTerm, members]);

  return (
    <div className="flex flex-col items-center mt-14 min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-700 mb-4">All CRP</h1>

        {error && <p className="text-red-500">{error}</p>}


        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search CRPs by name"
            className="w-full p-3 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // Update searchTerm on input change
          />
        </div>

        {/* Table for CRP members */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="text-gray-600 text-left border-b">
                <th className="py-3 px-4">CRP Name</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Password</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">No members found</td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr
                    key={member._id}
                    className="border-b hover:bg-gray-100 cursor-pointer transition"
                    // onClick={() => navigate(`/crp/crp-details/${member._id}`)} // Navigate to details page
                  >
                    <td className="py-3 px-4">{member.name}</td>
                    <td className="py-3 px-4">{member.mobile}</td>
                    <td className="py-3 px-4">{member.email}</td>
                    <td className="py-3 px-4">{member.password}</td>
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

export default AllCRP;
