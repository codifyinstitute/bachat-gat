import { useParams, useNavigate } from "react-router-dom";
import { Copy } from "lucide-react";
import { useState } from "react";

const MemberDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copiedField, setCopiedField] = useState(null);

  // Mock member data
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

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1000); // Reset copied status after 2 seconds
  };

  return (
    <div className="w-full p-0 bg-gradient-to-r from-blue-50 to-purple-100 min-h-screen">
      <div className="w-full bg-white shadow-lg rounded-lg px-2 py-3 md:px-4 lg:px-6 mx-auto">

        <h1 className="text-xl font-bold text-gray-800 mb-4 mt-4 ml-4">Member Details</h1>

        {/* Table Rendering */}
        <div className="overflow-x-auto bg-gradient-to-r from-indigo-100 to-blue-50 p-6 rounded-xl shadow-lg border-2 border-indigo-300">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Personal Information</h2>
          <table className="min-w-full table-auto border-separate border-spacing-0">
            <tbody className="divide-y divide-gray-200">
              {[
                { label: "ID", value: member._id },
                { label: "Name", value: member.name },
                { label: "Address", value: member.address },
                { label: "DOB", value: new Date(member.dateOfBirth).toLocaleDateString() },
                { label: "Aadhar", value: member.aadharNo },
                { label: "PAN", value: member.panNo },
                { label: "Mobile", value: member.mobileNumber },
                { label: "Status", value: member.status },
              ].map((item) => (
                <tr key={item.label}>
                  <td className="py-3 px-4 font-semibold text-gray-900 border-b border-gray-300">{item.label}</td>
                  <td className="py-3 px-4 border-b border-gray-300 flex justify-between items-center">
                    {item.value}
                    <button onClick={() => handleCopy(item.value, item.label)}>
                      <Copy className="w-5 h-5 text-gray-600 hover:text-gray-800 ml-4" />
                    </button>
                    {copiedField === item.label && <span className="text-green-600 ml-2 text-sm">Copied!</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Referred By Section */}
        <div className="overflow-x-auto bg-gradient-to-r from-green-100 to-yellow-50 mt-6 p-6 rounded-xl shadow-lg border-2 border-green-300">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Referred By</h2>
          <table className="min-w-full table-auto border-separate border-spacing-0">
            <tbody className="divide-y divide-gray-200">
              {[
                { label: "Name", value: member.referredBy.crpName },
                { label: "Mobile", value: member.referredBy.crpMobile },
                { label: "ID", value: member.referredBy.crpId },
              ].map((item) => (
                <tr key={item.label}>
                  <td className="py-3 px-4 font-semibold text-gray-900 border-b border-gray-300">{item.label}</td>
                  <td className="py-3 px-4 border-b border-gray-300 flex justify-between items-center">
                    {item.value}
                    <button onClick={() => handleCopy(item.value, item.label)}>
                      <Copy className="w-5 h-5 text-gray-600 hover:text-gray-800" />
                    </button>
                    {copiedField === item.label && <span className="text-green-600 ml-2 text-sm">Copied!</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Account Activity Section */}
        <div className="overflow-x-auto bg-gradient-to-r from-purple-100 to-pink-50 mt-6 p-6 rounded-xl shadow-lg border-2 border-purple-300">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Account Activity</h2>
          <table className="min-w-full table-auto border-separate border-spacing-0">
            <tbody className="divide-y divide-gray-200">
              {[
                { label: "Created At", value: new Date(member.createdAt).toLocaleDateString() },
                { label: "Updated At", value: new Date(member.updatedAt).toLocaleDateString() },
              ].map((item) => (
                <tr key={item.label}>
                  <td className="py-3 px-4 w-[47%] md:w-[30%] lg:w-[25%] font-semibold text-gray-900 border-b border-gray-300">{item.label}</td>
                  <td className="py-3 px-4 border-b border-gray-300 flex justify-between items-center">
                    {item.value}
                    <button onClick={() => handleCopy(item.value, item.label)}>
                      <Copy className="w-5 h-5 text-gray-600 hover:text-gray-800" />
                    </button>
                    {copiedField === item.label && <span className="text-green-600 ml-2 text-sm">Copied!</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          onClick={() => navigate("/admin/all-members")}
          className="mb-4 mt-4 ml-4 py-2 px-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-300"
        >
          &larr; Go Back
        </button>
      </div>
    </div>
  );
};

export default MemberDetails;
