import React, { useState, useEffect } from "react";
import axios from "axios";

const GroupList = () => {
  const [groups, setGroups] = useState([]);
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("admin_token");

      const response = await axios.get("http://localhost:5000/api/groups", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setGroups(response.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setMessage("Failed to fetch groups.");
    }
  };

  const toggleGroup = (groupId) => {
    setExpandedGroupId(expandedGroupId === groupId ? null : groupId);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto bg-gray-100 min-h-screen">
      <h1 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">Groups</h1>
      {message && <p className="text-red-600 text-center mb-4">{message}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <div
            key={group._id}
            onClick={() => toggleGroup(group._id)}
            className={`bg-white p-4 rounded-lg shadow-lg relative transition-all duration-300 ${
              expandedGroupId === group._id ? "h-auto" : "h-48"
            }`}
          >
            <h3 className="text-lg font-semibold text-gray-800">{group.name}</h3>
            <p className="text-sm text-gray-600">Address: {group.address}</p>
            <p className="text-sm text-gray-600">Status: {group.status}</p>

            {/* ReferredBy Details */}
            <p className="text-sm text-gray-600">
              <strong>Referred By:</strong> {group.referredBy.crpName}, {group.referredBy.crpMobile}
            </p>

            {/* Display members if expanded */}
            {expandedGroupId === group._id && (
              <div className="mt-4 space-y-2">
                <h4 className="font-semibold">Members:</h4>
                {group.members.map((member, index) => (
                  <div key={index} className="border p-2 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-800"><strong>Name:</strong> {member.member.name}</p>
                    <p className="text-sm text-gray-600"><strong>Mobile:</strong> {member.member.mobileNumber}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupList;
