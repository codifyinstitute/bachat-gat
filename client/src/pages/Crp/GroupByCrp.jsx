import React, { useEffect, useState } from "react";
import axios from "axios";

const GroupsList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const adminToken = localStorage.getItem("crp_token");
        if (!adminToken) {
          setError("No authentication token found. Please log in.");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:5000/api/groups/created-by-crp", {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        });

        setGroups(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching groups");
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (loading) return <p className="text-center text-lg">Loading groups...</p>;
  if (error) return <p className="text-center text-red-500 text-lg">{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-center mb-4">Groups Created by CRP</h2>
      {groups.length === 0 ? (
        <p className="text-center text-gray-500">No groups found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg overflow-hidden">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="p-3 text-left">Group Name</th>
                <th className="p-3 text-left">Address</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Members</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr key={group._id} className="border-b hover:bg-gray-100">
                  <td className="p-3 font-semibold">{group.name}</td>
                  <td className="p-3">{group.address}</td>
                  <td className={`p-3 font-semibold ${group.status === "active" ? "text-green-500" : "text-red-500"}`}>
                    {group.status}
                  </td>
                  <td className="p-3">
                    {group.members.length === 0 ? (
                      <p className="text-gray-500">No members</p>
                    ) : (
                      <ul className="list-disc pl-4">
                        {group.members.map((member, index) => (
                          member?.member ? ( // ✅ Check if member.member exists
                            <li key={index} className="flex justify-between">
                              <span>{member.member.name} ({member.member.mobileNumber})</span>
                              <span
                                className={`px-2 py-1 text-xs rounded-lg ${
                                  member.member.status === "active" ? "bg-green-200 text-green-700" : "bg-red-200 text-red-700"
                                }`}
                              >
                                {member.member.status}
                              </span>
                            </li>
                          ) : (
                            <li key={index} className="text-gray-500">Member data unavailable</li> // ✅ Handle missing data
                          )
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GroupsList;
