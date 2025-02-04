import { useParams, useNavigate } from "react-router-dom";
import { Copy } from "lucide-react";
import { useState, useEffect } from "react";

const MemberDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const token = localStorage.getItem("crp_token");
        const response = await fetch(`http://localhost:5000/api/member/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch member data");

        const data = await response.json();
        setMember(data);
      } catch (error) {
        console.error("Error fetching member data:", error);
      }
    };

    fetchMember();
  }, [id]);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1000);
  };

  if (!member) return <p className="text-center mt-10">Loading member details...</p>;

  // Replace backslashes with forward slashes and prepend the full backend URL
  const getFullImageUrl = (imagePath) => {
    return imagePath ? `http://localhost:5000/${imagePath.replace(/\\/g, '/')}` : "";
  };

  return (
    <div className="w-full p-0 bg-gradient-to-r from-blue-50 to-purple-100 min-h-screen">
      <div className="w-full bg-white shadow-lg rounded-lg px-2 py-3 md:px-4 lg:px-6 mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800 mb-4 mt-4 ml-4">Member Details</h1>
          <button className="mb-4 mt-4 ml-4 py-2 px-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-300">
            Add to group
          </button>
        </div>

        {/* Personal Information */}
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
              {member.referredBy && [
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

        {/* Guarantor Section */}
        {member.guarantor && (
          <div className="overflow-x-auto bg-gradient-to-r from-red-100 to-orange-50 mt-6 p-6 rounded-xl shadow-lg border-2 border-red-300">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Guarantor Information</h2>
            <table className="min-w-full table-auto border-separate border-spacing-0">
              <tbody className="divide-y divide-gray-200">
                {[  
                  { label: "Name", value: member.guarantor.name },
                  { label: "Mobile", value: member.guarantor.mobileNo },
                  { label: "Relation", value: member.guarantor.relation },
                  { label: "Photo", value: <img src={getFullImageUrl(member.guarantor.photo)} alt="Guarantor" className="h-16 w-16 rounded-full" /> },
                  { label: "Cheque Photo", value: <img src={getFullImageUrl(member.guarantor.chequePhoto)} alt="Cheque" className="h-16 w-16 rounded-md" /> },
                ].map((item) => (
                  <tr key={item.label}>
                    <td className="py-3 px-4 font-semibold text-gray-900 border-b border-gray-300">{item.label}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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
                  <td className="py-3 px-4 font-semibold text-gray-900 border-b border-gray-300">{item.label}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={() => navigate("/crp/crp-members")}
          className="mb-4 mt-4 ml-4 py-2 px-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-300"
        >
          &larr; Go Back
        </button>
      </div>
    </div>
  );
};

export default MemberDetails;
