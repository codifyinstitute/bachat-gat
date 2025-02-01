import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios"; // Import axios
import "aos/dist/aos.css";

const AllMembers = () => {
  const navigate = useNavigate(); // Get navigate function
  const [members, setMembers] = useState([]); // State to store fetched members
  const [error, setError] = useState(null); // State to store any error

  // Assuming the admin_token is stored in localStorage
  const adminToken = localStorage.getItem("crp_token");
  console.log(adminToken);

  useEffect(() => {
    // Fetch members data from backend API
    const fetchMembers = async () => {
      try {
        // Add Authorization header with Bearer token
        const response = await axios.get("http://localhost:5000/api/crp/membycrp", {
          headers: {
            Authorization: `Bearer ${adminToken}`, // Pass the token in the Authorization header
          },
        });

        console.log("API Response:", response.data); // Log the full response

        // Handle different response formats
        if (Array.isArray(response.data)) {
          setMembers(response.data); // Array of members
        } else if (response.data.members && Array.isArray(response.data.members)) {
          setMembers(response.data.members); // Nested 'members' array
        } else {
          setError("The response data is not in the expected format.");
        }
      } catch (err) {
        setError("Failed to fetch members data.");
        console.error(err);
      }
    };

    fetchMembers();
  }, [adminToken]); // Ensure the token is passed into useEffect (can also use session storage, cookies, etc.)

  if (error) {
    return <div>{error}</div>; // Display error message if there's an issue
  }

  return (
    <div className="flex flex-col items-center mt-14 min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-700 mb-4">All Members</h1>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="text-gray-600 text-left border-b">
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-4">Pan No</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr
                  key={member._id}
                  onClick={() => navigate(`/crp/Crp-memdetails/${member._id}`)} // Navigate to details page
                  className="border-b hover:bg-gray-100 cursor-pointer transition"
                >
                  <td className="py-3 px-4">{member.name}</td>
                  <td className="py-3 px-4">{member.mobileNumber}</td>
                  <td className="py-3 px-4">
                    {member.panNo}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${
                        member.status === "active"
                          ? "bg-green-200 text-green-700"
                          : "bg-red-200 text-red-700"
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllMembers;
