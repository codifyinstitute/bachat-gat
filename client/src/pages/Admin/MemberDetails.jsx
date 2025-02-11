import { useParams, useNavigate } from "react-router-dom";
import { Copy, X } from "lucide-react";
import { useState, useEffect } from "react";

const ImageModal = ({ imageUrl, onClose }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        setDimensions({
          width: img.width,
          height: img.height
        });
      };
    }
  }, [imageUrl]);

  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative bg-white p-4 rounded-lg max-w-[90vw] max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
        >
          <X className="w-4 h-4" />
        </button>
        <img
          src={imageUrl}
          alt="Full size"
          style={{
            maxWidth: '90vw',
            maxHeight: '80vh',
            width: dimensions.width,
            height: dimensions.height,
            objectFit: 'contain'
          }}
          className="rounded-lg"
        />
      </div>
    </div>
  );
};

const MemberDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const response = await fetch(`https://bachatapi.codifyinstitute.org/api/member/${id}`, {
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

  const handleImageClick = (imagePath) => {
    setSelectedImage(getFullImageUrl(imagePath));
  };

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return "";
    const relativePath = imagePath.replace(/\\/g, "/").replace(/^.*?uploads\//, "uploads/");
    return `https://bachatapi.codifyinstitute.org/${relativePath}`;
  };

  if (!member) return <p className="text-center mt-10">Loading member details...</p>;

  const ImageComponent = ({ src, alt, className }) => (
    <img
      src={src}
      alt={alt}
      className={`${className} cursor-pointer hover:opacity-80 transition-opacity`}
      onClick={() => handleImageClick(src)}
    />
  );

  return (
    <div className="w-full p-0 bg-gradient-to-r from-blue-50 to-purple-100 min-h-screen">
      <div className="w-full bg-white shadow-lg rounded-lg px-4 py-5 mx-auto">
        {/* ... existing header code ... */}

        {/* Personal Information */}
        <div className="bg-gradient-to-r from-indigo-100 to-blue-50 p-6 rounded-xl shadow-lg border-2 border-indigo-300">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Personal Information</h2>
          <table className="min-w-full table-auto">
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
                {
                  label: "Photo",
                  value: (
                    <ImageComponent
                      src={getFullImageUrl(member.photo)}
                      alt="Member"
                      className="h-16 w-16 rounded-full border border-gray-300"
                    />
                  ),
                },
              ].map((item) => (
                <tr key={item.label}>
                  <td className="py-3 px-4 font-semibold text-gray-900">{item.label}</td>
                  <td className="py-3 px-4 flex justify-between items-center">
                    {item.value}
                    {typeof item.value === 'string' && (
                      <button onClick={() => handleCopy(item.value, item.label)}>
                        <Copy className="w-5 h-5 text-gray-600 hover:text-gray-800 ml-2" />
                      </button>
                    )}
                    {copiedField === item.label && <span className="text-green-600 ml-2 text-sm">Copied!</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Guarantor Section */}
        {member.guarantor && (
          <div className="bg-gradient-to-r from-red-100 to-orange-50 mt-6 p-6 rounded-xl shadow-lg border-2 border-red-300">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Guarantor Information</h2>
            <table className="min-w-full table-auto">
              <tbody className="divide-y divide-gray-200">
                {[
                  { label: "Name", value: member.guarantor.name },
                  { label: "Mobile", value: member.guarantor.mobileNo },
                  { label: "Relation", value: member.guarantor.relation },
                  {
                    label: "Photo",
                    value: (
                      <ImageComponent
                        src={getFullImageUrl(member.guarantor.photo)}
                        alt="Guarantor"
                        className="h-16 w-16 rounded-full border border-gray-300"
                      />
                    ),
                  },
                  {
                    label: "Cheque Photo",
                    value: (
                      <ImageComponent
                        src={getFullImageUrl(member.guarantor.chequePhoto)}
                        alt="Cheque"
                        className="h-16 w-16 rounded-md border border-gray-300"
                      />
                    ),
                  },
                  {
                    label: "Document 1",
                    value: (
                      <ImageComponent
                        src={getFullImageUrl(member.guarantor.extraDocuments_0)}
                        alt="Document 1"
                        className="h-16 w-16 rounded-md border border-gray-300"
                      />
                    ),
                  },
                  {
                    label: "Document 2",
                    value: (
                      <ImageComponent
                        src={getFullImageUrl(member.guarantor.extraDocuments_1)}
                        alt="Document 2"
                        className="h-16 w-16 rounded-md border border-gray-300"
                      />
                    ),
                  },
                  {
                    label: "Document 3",
                    value: (
                      <ImageComponent
                        src={getFullImageUrl(member.guarantor.extraDocuments_2)}
                        alt="Document 3"
                        className="h-16 w-16 rounded-md border border-gray-300"
                      />
                    ),
                  },
                  {
                    label: "Document 4",
                    value: (
                      <ImageComponent
                        src={getFullImageUrl(member.guarantor.extraDocuments_3)}
                        alt="Document 4"
                        className="h-16 w-16 rounded-md border border-gray-300"
                      />
                    ),
                  },
                ].map((item) => (
                  <tr key={item.label}>
                    <td className="py-3 px-4 font-semibold text-gray-900">{item.label}</td>
                    <td className="py-3 px-4">{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Account Activity Section */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-50 mt-6 p-6 rounded-xl shadow-lg border-2 border-purple-300">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Account Activity</h2>
          <table className="min-w-full table-auto">
            <tbody className="divide-y divide-gray-200">
              {[
                { label: "Created At", value: new Date(member.createdAt).toLocaleDateString() },
                { label: "Updated At", value: new Date(member.updatedAt).toLocaleDateString() },
              ].map((item) => (
                <tr key={item.label}>
                  <td className="py-3 px-4 font-semibold text-gray-900">{item.label}</td>
                  <td className="py-3 px-4">{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={() => navigate("/admin/all-members")}
          className="mb-4 mt-4 py-2 px-4 bg-blue-600 text-white rounded-full hover:bg-blue-700"
        >
          &larr; Go Back
        </button>
      </div>

      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

export default MemberDetails;