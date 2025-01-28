// import React, { useState, useEffect } from "react";
// import AOS from "aos";
// import "aos/dist/aos.css";

// const AllMembers = () => {
//   const [expandedMemberId, setExpandedMemberId] = useState(null);

//   useEffect(() => {
//     AOS.init({ duration: 500 });
//   }, []);

//   const members = [
//     {
//       _id: "67976dadd0b95e0d78a2e947",
//       name: "Shubham Doe Updated",
//       address: "456 Updated Street",
//       dateOfBirth: "1990-01-01T00:00:00.000+00:00",
//       referredBy: {
//         crpName: "John Doe",
//         crpMobile: "1234567890",
//         crpId: "67973b222d4bd6c8d0898869",
//       },
//       aadharNo: "123456789012",
//       panNo: "ABCDE1234F",
//       mobileNumber: "9876543210",
//       guarantor: {
//         name: "Jane Doe",
//         mobileNo: "1234567890",
//         relation: "Mother",
//         photo: "uploads/guarantor-photo.png",
//       },
//       chequePhoto: "uploads/cheque-photo.png",
//       extraDocuments: ["uploads/document1.png", "uploads/document2.png"],
//       status: "Active",
//       createdAt: "2025-01-27T11:27:41.305+00:00",
//       updatedAt: "2025-01-27T11:27:41.305+00:00",
//     },
//     {
//       _id: "67976dadd0b95e0d78a2e947",
//       name: "Shubham Doe Updated",
//       address: "456 Updated Street",
//       dateOfBirth: "1990-01-01T00:00:00.000+00:00",
//       referredBy: {
//         crpName: "John Doe",
//         crpMobile: "1234567890",
//         crpId: "67973b222d4bd6c8d0898869",
//       },
//       aadharNo: "123456789012",
//       panNo: "ABCDE1234F",
//       mobileNumber: "9876543210",
//       guarantor: {
//         name: "Jane Doe",
//         mobileNo: "1234567890",
//         relation: "Mother",
//         photo: "uploads/guarantor-photo.png",
//       },
//       chequePhoto: "uploads/cheque-photo.png",
//       extraDocuments: ["uploads/document1.png", "uploads/document2.png"],
//       status: "Inactive",
//       createdAt: "2025-01-27T11:27:41.305+00:00",
//       updatedAt: "2025-01-27T11:27:41.305+00:00",
//     },
//   ];

//   const toggleDropdown = (id) => {
//     setExpandedMemberId((prevId) => (prevId === id ? null : id));
//   };

//   return (
//     <div className="flex flex-col items-center mt-14 min-h-screen bg-gray-100 p-4">
//       <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
//         <h1 className="text-2xl font-semibold text-gray-700 mb-4">All Members</h1>

//         <div className="overflow-x-auto">
//           <table className="min-w-full bg-white">
//             <thead>
//               <tr className="text-gray-600 text-left border-b">
//                 <th className="py-3 px-4">Member Name</th>
//                 <th className="py-3 px-4">Mobile</th>
//                 <th className="py-3 px-4">Email</th>
//                 <th className="py-3 px-4">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {members.map((member) => (
//                 <React.Fragment key={member._id}>
//                   <tr
//                     onClick={() => toggleDropdown(member._id)}
//                     className="border-b hover:bg-gray-100 cursor-pointer transition"
//                   >
//                     <td className="py-3 px-4">{member.name}</td>
//                     <td className="py-3 px-4">{member.mobileNumber}</td>
//                     <td className="py-3 px-4">{member.referredBy?.crpName}@example.com</td>
//                     <td className="py-3 px-4">
//                       <span
//                         className={`px-3 py-1 text-sm font-medium rounded-full ${
//                           member.status === "Active"
//                             ? "bg-green-200 text-green-700"
//                             : "bg-red-200 text-red-700"
//                         }`}
//                       >
//                         {member.status}
//                       </span>
//                     </td>
//                   </tr>

//                   {/* Dropdown Content */}
//                   {expandedMemberId === member._id && (
//                     <tr data-aos="fade-down">
//                       <td colSpan="4" className="p-4 bg-gray-50">
//                         <div className="p-4 bg-white shadow-md rounded-lg">
//                           <h3 className="text-lg font-semibold text-gray-700">Member Details</h3>
//                           <p className="text-gray-600"><strong>ID:</strong> {member._id}</p>
//                           <p className="text-gray-600"><strong>Name:</strong> {member.name}</p>
//                           <p className="text-gray-600"><strong>Address:</strong> {member.address}</p>
//                           <p className="text-gray-600"><strong>Date of Birth:</strong> {new Date(member.dateOfBirth).toLocaleDateString()}</p>
//                           <p className="text-gray-600"><strong>Aadhar No:</strong> {member.aadharNo}</p>
//                           <p className="text-gray-600"><strong>PAN No:</strong> {member.panNo}</p>
//                           <p className="text-gray-600"><strong>Mobile Number:</strong> {member.mobileNumber}</p>

//                           {/* Referred By */}
//                           {member.referredBy && (
//                             <div className="mt-2">
//                               <h3 className="font-semibold">Referred By</h3>
//                               <p><strong>Name:</strong> {member.referredBy.crpName}</p>
//                               <p><strong>Mobile:</strong> {member.referredBy.crpMobile}</p>
//                               <p><strong>ID:</strong> {member.referredBy.crpId}</p>
//                             </div>
//                           )}

//                           {/* Guarantor Details */}
//                           {member.guarantor && (
//                             <div className="mt-2">
//                               <h3 className="font-semibold">Guarantor</h3>
//                               <p><strong>Name:</strong> {member.guarantor.name}</p>
//                               <p><strong>Mobile No:</strong> {member.guarantor.mobileNo}</p>
//                               <p><strong>Relation:</strong> {member.guarantor.relation}</p>
//                               <img src={member.guarantor.photo} alt="Guarantor" className="mt-2 w-24 rounded-md" />
//                             </div>
//                           )}

//                           {/* Cheque & Extra Documents */}
//                           {member.chequePhoto && (
//                             <div className="mt-2">
//                               <h3 className="font-semibold">Cheque Photo</h3>
//                               <img src={member.chequePhoto} alt="Cheque" className="mt-2 w-24 rounded-md" />
//                             </div>
//                           )}

//                           {member.extraDocuments && member.extraDocuments.length > 0 && (
//                             <div className="mt-2">
//                               <h3 className="font-semibold">Extra Documents</h3>
//                               {member.extraDocuments.map((doc, index) => (
//                                 <img key={index} src={doc} alt={`Document ${index + 1}`} className="mt-2 w-24 rounded-md" />
//                               ))}
//                             </div>
//                           )}

//                           <p className="text-gray-600"><strong>Created At:</strong> {new Date(member.createdAt).toLocaleDateString()}</p>
//                           <p className="text-gray-600"><strong>Updated At:</strong> {new Date(member.updatedAt).toLocaleDateString()}</p>
//                         </div>
//                       </td>
//                     </tr>
//                   )}
//                 </React.Fragment>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AllMembers;





import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "aos/dist/aos.css";

const AllMembers = () => {
  const navigate = useNavigate(); // Get navigate function

  const members = [
    {
      _id: "67976dadd0b95e0d78a2e947",
      name: "Shubham Doe Updated",
      mobileNumber: "9876543210",
      referredBy: { crpName: "John Doe" },
      status: "Active",
    },
    {
      _id: "67976dadd0b95e0d78a2e948",
      name: "John Doe",
      mobileNumber: "9876543211",
      referredBy: { crpName: "Jane Doe" },
      status: "Inactive",
    },
  ];

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
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr
                  key={member._id}
                  onClick={() => navigate(`/admin/member/${member._id}`)} // Navigate to details page
                  className="border-b hover:bg-gray-100 cursor-pointer transition"
                >
                  <td className="py-3 px-4">{member.name}</td>
                  <td className="py-3 px-4">{member.mobileNumber}</td>
                  <td className="py-3 px-4">{member.referredBy.crpName}@example.com</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${
                        member.status === "Active"
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
