import React, { useEffect, useState } from "react";
import axios from "axios"; // Import axios
import "aos/dist/aos.css";
import { useNavigate } from "react-router-dom";

const AllCRP = () => {
  const navigate = useNavigate(); // Get navigate function
  const [members, setMembers] = useState([]); // State to store fetched members
  const [error, setError] = useState(null); // State to store any error

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
          setMembers(response.data.crps); // Extract the 'crps' array
        }
      } catch (err) {
        setError("Failed to fetch members data.");
        console.error(err);
      }
    };

    fetchMembers();
  }, [adminToken]);

  return (
    <div className="flex flex-col items-center mt-14 min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-700 mb-4">All CRP</h1>

        {error && <p className="text-red-500">{error}</p>}

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="text-gray-600 text-left border-b">
                <th className="py-3 px-4">CRP Name</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-4">Email</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr
                  key={member._id}
                  className="border-b hover:bg-gray-100 cursor-pointer transition"
                >
                  <td className="py-3 px-4">{member.name}</td>
                  <td className="py-3 px-4">{member.mobile}</td>
                  <td className="py-3 px-4">{member.email}</td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllCRP;
