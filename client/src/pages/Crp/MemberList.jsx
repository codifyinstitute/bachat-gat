// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const MemberList = () => {
//   const [members, setMembers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchMembers = async () => {
//       try {
//         const token = localStorage.getItem("crp_token");
//         const response = await axios.get("https://bachatapi.codifyinstitute.org/api/member", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         setMembers(response.data);
//       } catch (err) {
//         setError(err.response?.data?.message || "Failed to fetch members.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMembers();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <p className="text-red-500 text-lg">{error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-4">
//       <h1 className="text-2xl font-bold text-center mb-6 text-blue-600">Member List</h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {members.map((member) => (
//           <div
//             key={member._id}
//             className="bg-white rounded-lg shadow-md hover:shadow-xl p-4 transition-transform transform hover:-translate-y-2"
//           >
//             <h2 className="text-lg font-semibold text-gray-800">{member.name}</h2>
//             <p className="text-gray-600 text-sm">Mobile: {member.mobileNumber}</p>
//             {member.guarantor && (
//               <p className="text-gray-600 text-sm">
//                 Guarantor: {member.guarantor.name}
//               </p>
//             )}
//             <p className="text-gray-600 text-sm">Joined: {new Date(member.createdAt).toLocaleDateString()}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default MemberList;