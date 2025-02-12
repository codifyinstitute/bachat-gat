import React, { useEffect, useState } from 'react';

const CrpNpalist = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // State for search input

  useEffect(() => {
    // Fetch data from API when the component mounts
    const fetchMembers = async () => {
      const crpToken = localStorage.getItem('crp_token'); // Retrieve CRP token

      if (!crpToken) {
        alert("CRP Token not found in local storage!");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/crp/membycrp', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${crpToken}`, // Add the token in the headers
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch members');
        }

        const data = await response.json();

        console.log('Fetched Data:', data); // Log the entire response object

        // Now we inspect the structure of 'data'
        if (Array.isArray(data)) {
          // Sort members by isNPA field (YES at top, NO at bottom)
          const sortedMembers = data.sort((a, b) => {
            if (a.isNPA === 'YES' && b.isNPA === 'NO') return -1;
            if (a.isNPA === 'NO' && b.isNPA === 'YES') return 1;
            return 0;
          });

          setMembers(sortedMembers);
        } else {
          // Check if the data has a nested property like 'members' or 'data' that contains the array
          if (data.members && Array.isArray(data.members)) {
            const sortedMembers = data.members.sort((a, b) => {
              if (a.isNPA === 'YES' && b.isNPA === 'NO') return -1;
              if (a.isNPA === 'NO' && b.isNPA === 'YES') return 1;
              return 0;
            });

            setMembers(sortedMembers);
          } else {
            console.error('Data is not in the expected format:', data);
            alert('Received data is not in the expected format.');
          }
        }
      } catch (error) {
        console.error('Error fetching members:', error);
        alert('Failed to load members');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Filter members based on search query
  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render loading state or member list
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className=" inline-block " role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto my-8 p-6 bg-white shadow-xl rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6">Members List</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          placeholder="Search members by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Update search query state on change
        />
      </div>

      {/* Table for displaying members */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-left border-collapse">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-2 text-center">Name</th>
              <th className="px-4 py-2 text-center">Phone</th>
              <th className="px-4 py-2 text-center">NPA Status</th>
              <th className="px-4 py-2 text-center">Status</th>
              <th className="px-4 py-2 text-center">CRP Name</th>
              <th className="px-4 py-2 text-center">Guarantor</th>
              <th className="px-4 py-2 text-center">Guarantor Mobile</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => (
              <tr key={member._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 text-center">{member.name}</td>
                <td className="px-4 py-2 text-center">{member.mobileNumber}</td>
                <td className="px-4 py-2 text-center">
                  <span className={member.isNPA === 'YES' ? 'bg-red-100 p-1 text-red-500 rounded' : 'bg-green-100 p-1 text-green-500 rounded'}>
                    {member.isNPA}
                  </span>
                </td>
                <td className="px-4 py-2 text-center">
                  <span className={member.status === 'inactive' ? 'bg-red-50 rounded p-1 text-red-700' : 'bg-green-50 text-green-700 p-1 rounded'}>
                    {member.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-center">{member.referredBy?.crpName}</td>
                <td className="px-4 py-2 text-center">{member.guarantor.name}</td>
                <td className="px-4 py-2 text-center">{member.guarantor.mobileNo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CrpNpalist;
