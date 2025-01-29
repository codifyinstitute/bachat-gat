import React, { useState, useEffect } from "react";
import axios from "axios";
import { Eye } from "lucide-react"; // For eye icon

const GroupsList = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const token = localStorage.getItem("admin_token");
            console.log(token)

            const response = await axios.get("http://localhost:5000/api/groups", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("API Response:", response.data); // Debugging the API response

            setGroups(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching groups:", error);
            setLoading(false);
            alert("Failed to fetch groups.");
        }
    };

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto bg-gray-100 min-h-screen">
            <h1 className="text-xl sm:text-2xl font-bold text-center mb-6">Groups List</h1>
            {loading ? (
                <div className="text-center text-gray-500">Loading groups...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {groups.length === 0 ? (
                        <div className="text-center text-gray-500">No groups available</div>
                    ) : (
                        groups.map((group) => (
                            <div
                                key={group._id}
                                className="group-card bg-white shadow-lg rounded-lg p-6 hover:shadow-2xl transform transition-all duration-300"
                            >
                                <div className="group-header flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-800">{group.name}</h3>
                                    <p className="text-sm text-gray-500">{group.status}</p>
                                </div>
                                <p className="text-sm text-gray-600">Address: {group.address}</p>

                                <div className="hidden-details mt-4 group-hover:block hidden opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    {group.referredBy && (
                                        <div className="text-sm text-gray-600 mt-2">
                                            <strong>Referred By:</strong> {group.referredBy.crpName}
                                        </div>
                                    )}
                                    {group.referredBy && group.referredBy.crpMobile && (
                                        <div className="text-sm text-gray-600 mt-1">
                                            <strong>Referred Mobile:</strong> {group.referredBy.crpMobile}
                                        </div>
                                    )}
                                    {group.members && group.members.length > 0 && (
                                        <div className="text-sm text-gray-600 mt-1">
                                            <strong>Members:</strong>{" "}
                                            {group.members.map((member, index) => (
                                                <span
                                                    key={index}
                                                    className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs mr-2"
                                                >
                                                    {member.member}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="text-center mt-4">
                                    <button
                                        className="bg-blue-500 text-white px-3 py-1 text-sm rounded flex items-center justify-center"
                                        onClick={() => alert(`View more details for group: ${group.name}`)}
                                    >
                                        <Eye className="w-4 h-4 mr-1" /> View
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default GroupsList;
