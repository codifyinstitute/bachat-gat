import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search } from "lucide-react";

const GroupList = () => {
  const [groups, setGroups] = useState([]);
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/banks");
        setBanks(response.data);
      } catch (err) {
        setError("Failed to fetch banks.");
      } finally {
        setLoading(false);
      }
    };
    fetchBanks();
  }, []);

  useEffect(() => {
    filterGroups();
  }, [searchQuery, groups]);

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
      setFilteredGroups(response.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setMessage("Failed to fetch groups.");
    }
  };

  const filterGroups = () => {
    const query = searchQuery.toLowerCase().trim();
    
    if (!query) {
      setFilteredGroups(groups);
      return;
    }

    const filtered = groups.filter(group => {
      // Search in group details
      const groupMatches = 
        group.name.toLowerCase().includes(query) ||
        group.address.toLowerCase().includes(query) ||
        group.status.toLowerCase().includes(query) ||
        group.referredBy.crpName.toLowerCase().includes(query) ||
        group.referredBy.crpMobile.includes(query);

      // Search in members
      const memberMatches = group.members.some(member =>
        member.member.name.toLowerCase().includes(query) ||
        member.member.mobileNumber.includes(query)
      );

      return groupMatches || memberMatches;
    });

    setFilteredGroups(filtered);
  };

  const toggleGroup = (groupId) => {
    setExpandedGroupId(expandedGroupId === groupId ? null : groupId);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto bg-gray-100 min-h-screen">
      <h1 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">Groups</h1>
      
      {/* Search Bar */}
      <div className="mb-6 max-w-xl mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Search groups or members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {message && <p className="text-red-600 text-center mb-4">{message}</p>}

      {filteredGroups.length === 0 && searchQuery && (
        <p className="text-center text-gray-600 mb-4">No matching groups or members found.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroups.map((group) => (
          <div
            key={group._id}
            onClick={() => toggleGroup(group._id)}
            className={`bg-white p-4 rounded-lg shadow-lg relative transition-all duration-300 cursor-pointer hover:shadow-xl ${
              expandedGroupId === group._id ? "h-auto" : "h-48"
            }`}
          >
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-gray-800">{group.name}</h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Address: {group.address}</p>
                <p className="text-sm text-gray-600">
                  Status: <span className={`font-medium ${
                    group.status.toLowerCase() === 'active' ? 'text-green-600' : 'text-red-600'
                  }`}>{group.status}</span>
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-600 border-t pt-2">
              <p className="font-medium">Referred By:</p>
              <p>{group.referredBy.crpName}</p>
              <p>{group.referredBy.crpMobile}</p>
            </div>

            {expandedGroupId === group._id && (
              <div className="mt-4 space-y-2">
                <h4 className="font-semibold border-b pb-2">Members ({group.members.length})</h4>
                <div className="max-h-60 overflow-y-auto">
                  {group.members.map((member, index) => (
                    <div 
                      key={index} 
                      className="border p-2 rounded-lg bg-gray-50 mb-2 hover:bg-gray-100"
                    >
                      <p className="text-sm text-gray-800">
                        <strong>Name:</strong> {member.member.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Mobile:</strong> {member.member.mobileNumber}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupList;