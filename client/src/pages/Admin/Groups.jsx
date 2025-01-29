import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Users, User } from "lucide-react"; // Importing specific Lucide icons
import AOS from "aos";
import "aos/dist/aos.css"; // Import AOS CSS for animations

const GroupsList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize AOS for animations
    AOS.init();

    const fetchGroups = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("admin_token");

        if (!token) {
          alert("Authorization token is missing.");
          return;
        }

        const response = await axios.get("http://localhost:5000/api/groups", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        setGroups(response.data);
      } catch (error) {
        console.error("Error fetching groups:", error);
        alert("Failed to fetch groups. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Groups</h1>

      {loading ? (
        <p>Loading groups...</p>
      ) : (
        <div>
          {groups.map((group) => (
            <div
              key={group._id}
              className="bg-white shadow-md rounded p-4 mb-4"
              data-aos="fade-up"
              data-aos-duration="500"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {/* Group Icon with fallback */}
                  <img
                    src={group.icon || "https://via.placeholder.com/40"} // Placeholder icon URL
                    alt={group.name}
                    className="w-10 h-10 rounded-full mr-4"
                  />
                  <h2 className="text-xl font-semibold">{group.name}</h2>
                </div>
                <p>{group.members.length} Members</p>
              </div>

              {/* AOS animation for showing the dropdown */}
              <div
                className="group-dropdown cursor-pointer text-blue-500 hover:underline mt-2"
                data-aos="fade-down"
                data-aos-duration="300"
              >
                <span>View Members</span>
                {/* Dropdown List */}
                <div className="dropdown-content mt-2 p-2 bg-gray-100 rounded">
                  {group.members.length > 0 ? (
                    group.members.map((member) => (
                      <div
                        key={member._id}
                        className="flex justify-between items-center p-2 hover:bg-gray-200"
                      >
                        <div className="flex items-center">
                          {/* Lucide User Icon */}
                          <User className="w-5 h-5 mr-2 text-gray-600" />
                          <span>{member.name}</span>
                        </div>
                        <span>{member.mobileNumber}</span>
                        <Link
                          to={`/admin/member/${member._id}`}
                          className="text-blue-500"
                        >
                          View Details
                        </Link>
                      </div>
                    ))
                  ) : (
                    <p>No members available.</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupsList;
