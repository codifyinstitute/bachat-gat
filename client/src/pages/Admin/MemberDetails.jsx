import { useParams, useNavigate } from "react-router-dom";

const MemberDetails = () => {
  const { id } = useParams(); // Get the member ID from the URL
  const navigate = useNavigate(); // Use navigate for the back button

  // Example member data (in a real app, this could come from an API or context)
  const member = {
    _id: id,
    name: "Shubham Doe Updated",
    address: "456 Updated Street",
    dateOfBirth: "1990-01-01T00:00:00.000+00:00",
    aadharNo: "123456789012",
    panNo: "ABCDE1234F",
    mobileNumber: "9876543210",
    status: "Active",
    referredBy: {
      crpName: "John Doe",
      crpMobile: "1234567890",
      crpId: "67973b222d4bd6c8d0898869",
    },
    createdAt: "2025-01-27T11:27:41.305+00:00",
    updatedAt: "2025-01-27T11:27:41.305+00:00",
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 bg-gradient-to-r from-blue-50 to-purple-100 min-h-screen">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-4xl bg-white shadow-lg rounded-lg p-6 sm:p-8 md:p-10 lg:p-12 mx-auto">
        <button
          onClick={() => navigate("/admin/all-members")}
          className="mb-4 sm:mb-6 py-2 px-4 sm:px-6 md:px-8 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-300"
        >
          &larr; Back to Members List
        </button>

        <h1 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
          Member Details
        </h1>

        {/* Member Info Table */}
        <div className="overflow-x-auto bg-gradient-to-r from-indigo-100 to-blue-50 p-4 sm:p-6 md:p-8 lg:p-10 rounded-xl shadow-lg border-2 border-indigo-300">
          <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-700 mb-4">
            Personal Information
          </h2>
          <table className="min-w-full table-auto border-separate border-spacing-0">
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 border-b border-gray-300">ID</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 border-b border-gray-300">{member._id}</td>
              </tr>
              <tr>
                <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 border-b border-gray-300">Name</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 border-b border-gray-300">{member.name}</td>
              </tr>
              <tr>
                <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 border-b border-gray-300">Address</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 border-b border-gray-300">{member.address}</td>
              </tr>
              <tr>
                <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 border-b border-gray-300">Date of Birth</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 border-b border-gray-300">{new Date(member.dateOfBirth).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 border-b border-gray-300">Aadhar No</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 border-b border-gray-300">{member.aadharNo}</td>
              </tr>
              <tr>
                <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 border-b border-gray-300">PAN No</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 border-b border-gray-300">{member.panNo}</td>
              </tr>
              <tr>
                <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 border-b border-gray-300">Mobile</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 border-b border-gray-300">{member.mobileNumber}</td>
              </tr>
              <tr>
                <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 border-b border-gray-300">Status</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 border-b border-gray-300">
                  <span className={`text-${member.status === "Active" ? 'green' : 'red'}-600 font-semibold`}>
                    {member.status}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Referred By Section */}
        <div className="overflow-x-auto bg-gradient-to-r from-green-100 to-yellow-50 mt-6 sm:mt-8 p-4 sm:p-6 md:p-8 lg:p-10 rounded-xl shadow-lg border-2 border-green-300">
          <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-700 mb-4">
            Referred By
          </h2>
          <table className="min-w-full table-auto border-separate border-spacing-0">
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 border-b border-gray-300">Name</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 border-b border-gray-300">{member.referredBy.crpName}</td>
              </tr>
              <tr>
                <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 border-b border-gray-300">Mobile</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 border-b border-gray-300">{member.referredBy.crpMobile}</td>
              </tr>
              <tr>
                <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 border-b border-gray-300">ID</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 border-b border-gray-300">{member.referredBy.crpId}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Timestamps Section */}
        <div className="overflow-x-auto bg-gradient-to-r from-purple-100 to-pink-50 mt-6 sm:mt-8 p-4 sm:p-6 md:p-8 lg:p-10 rounded-xl shadow-lg border-2 border-purple-300">
          <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-700 mb-4">
            Account Activity
          </h2>
          <table className="min-w-full table-auto border-separate border-spacing-0">
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 border-b border-gray-300">Created At</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 border-b border-gray-300">{new Date(member.createdAt).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 border-b border-gray-300">Updated At</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 border-b border-gray-300">{new Date(member.updatedAt).toLocaleDateString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MemberDetails;
