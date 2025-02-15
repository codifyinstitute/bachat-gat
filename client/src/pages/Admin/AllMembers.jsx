import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios"; // Import axios
import "aos/dist/aos.css";
import { Trash2 } from "lucide-react";

const AllMembers = () => {
  const navigate = useNavigate(); // Get navigate function
  const [members, setMembers] = useState([]); // State to store fetched members
  const [error, setError] = useState(null); // State to store any error
  const [searchTerm, setSearchTerm] = useState(""); // State to store the search term
  const [filteredMembers, setFilteredMembers] = useState([]); // State to store filtered members

  // Assuming the admin_token is stored in localStorage
  const adminToken = localStorage.getItem("admin_token");
  // console.log(adminToken);

  useEffect(() => {
    // Fetch members data from backend API
    const fetchMembers = async () => {
      try {
        // Add Authorization header with Bearer token
        const response = await axios.get(
          "http://localhost:5000/api/member",
          {
            headers: {
              Authorization: `Bearer ${adminToken}`, // Pass the token in the Authorization header
            },
          }
        );

        // console.log("API Response:", response.data); // Log the full response

        // Handle different response formats
        if (Array.isArray(response.data)) {
          // Sort members by 'createdAt' field (most recent first)
          const sortedMembers = response.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setMembers(sortedMembers); // Set sorted members
          setFilteredMembers(sortedMembers); // Set filtered members initially
        } else if (
          response.data.members &&
          Array.isArray(response.data.members)
        ) {
          // Sort members by 'createdAt' field (most recent first)
          const sortedMembers = response.data.members.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setMembers(sortedMembers); // Set sorted members
          setFilteredMembers(sortedMembers); // Set filtered members initially
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


  if (error) {
    return <div>{error}</div>; // Display error message if there's an issue
  }

  const handleDelete = async (_id, event) => {
    event.stopPropagation(); // Prevent row click event

    // Confirm deletion
    const isConfirmed = window.confirm("Do you want to delete this member?");
    if (!isConfirmed) return; // Do nothing if the user cancels

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/member/${_id}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`, // Pass the token in the Authorization header
          },
        }
      );

      if (response.status === 200) {
        // console.log("Member deleted successfully");

        // Show success notification
        alert("Member deleted successfully!");

        // Fetch updated members list from API after deletion
        const updatedResponse = await axios.get(
          "http://localhost:5000/api/member",
          {
            headers: {
              Authorization: `Bearer ${adminToken}`,
            },
          }
        );

        // Sort the members again after deletion
        const sortedMembers = updatedResponse.data.members || updatedResponse.data;
        const sortedByCreatedAt = sortedMembers.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setMembers(sortedByCreatedAt); // Update sorted members
      } else if (response.status === 400 && response.data.message) {
        // Alert the message if response status is 400
        alert(response.data.message);
      } else {
        // console.log("Deletion of member failed");
        alert("Failed to delete the member.");
      }
    } catch (error) {
      console.error("Error deleting member:", error);
      // Check for the error response and alert the message
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(error.response.data.message);
      } else {
        alert("An error occurred while deleting the member.");
      }
    }
  };

  // const toggleNPA = async (_id, event) => {
  //   event.stopPropagation();
  //   try {
  //     const response = await axios.put(
  //       `http://localhost:5000/api/member/${_id}/toggle-npa`,
  //       {},
  //       { headers: { Authorization: `Bearer ${adminToken}` } }
  //     );

  //     console.log("Updated Member Response:", response.data); // 🔍 Debugging log

  //     setMembers(
  //       members.map((member) =>
  //         member._id === _id
  /////           ? { ...member, isNPA: member.isNPA === "NO" ? "YES" : "NO" } 
  //           : member
  //       )
  //     );
  //   } catch (error) {
  //     console.error("Error updating NPA status:", error);
  //     alert("Failed to update NPA status.");
  //   }
  // };

  return (
    <div className="flex flex-col items-center mt-14 min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-700 mb-4">
          All Members
        </h1>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search members by name"
            className="w-full p-3 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // Update searchTerm on input change
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="text-gray-600 text-left border-b">
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-4">Pan No</th>
                <th className="py-3 px-4">NPA</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr
                  key={member._id}
                  onClick={() => navigate(`/admin/member/${member._id}`)} // Navigate to details page
                  className="border-b hover:bg-gray-100 cursor-pointer transition"
                >
                  <td className="py-3 px-4">{member.name}</td>
                  <td className="py-3 px-4">{member.mobileNumber}</td>
                  <td className="py-3 px-4">{member.panNo}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded ${member.isNPA === "YES"
                        ? "bg-green-300 text-black"
                        : "bg-red-200 text-black"
                        }`}
                      // onClick={(event) => toggleNPA(member._id, event)}
                    >
                      {member.isNPA === "YES" ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${member.status === "active"
                        ? "bg-green-200 text-green-700"
                        : "bg-red-200 text-red-700"
                        }`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td
                    className="py-3 px-4 text-red-600"
                    onClick={(event) => handleDelete(member._id, event)}
                  >
                    <Trash2 />
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
