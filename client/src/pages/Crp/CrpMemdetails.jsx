import { useParams, useNavigate } from "react-router-dom";
import { Copy } from "lucide-react";
import { useState, useEffect } from "react";

const CrpMemberDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMember, setEditedMember] = useState(null);
  const [error, setError] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [guarantorPhotoFile, setGuarantorPhotoFile] = useState(null);
  const [chequePhotoFile, setChequePhotoFile] = useState(null);
  const [fileextraDocuments_0, setFileExtraDocuments_0] = useState(null);
  const [fileextraDocuments_1, setFileExtraDocuments_1] = useState(null);
  const [fileextraDocuments_2, setFileExtraDocuments_2] = useState(null);
  const [fileextraDocuments_3, setFileExtraDocuments_3] = useState(null);

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
        // Initialize editedMember with all the original data
        setEditedMember({
          ...data,  // Keep all original fields
          name: data.name || "",
          address: data.address || "",
          aadharNo: data.aadharNo || "",
          panNo: data.panNo || "",
          mobileNumber: data.mobileNumber || "",
          status: data.status || "",
          dateOfBirth: data.dateOfBirth,
          photo: data.photo || "",
          ...(data.guarantor || {}),  // Keep all original guarantor fields
          guarantor: {
            name: data.guarantor?.name || "",
            mobileNo: data.guarantor?.mobileNo || "",
            relation: data.guarantor?.relation || "",
            photo: data.guarantor?.photo || "",
            chequePhoto: data.guarantor?.chequePhoto || "",
            extraDocuments_0: data.guarantor?.extraDocuments_0 || "",
            extraDocuments_1: data.guarantor?.extraDocuments_1 || "",
            extraDocuments_2: data.guarantor?.extraDocuments_2 || "",
            extraDocuments_3: data.guarantor?.extraDocuments_3 || "",
          }
        });
      } catch (error) {
        console.error("Error fetching member data:", error);
        setError("Failed to load member data");
      }
    };

    fetchMember();
  }, [id]);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1000);
  };

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return "";
    const relativePath = imagePath.replace(/\\/g, "/").replace(/^.*?uploads\//, "uploads/");
    return `http://localhost:5000/${relativePath}`;
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleInputChange = (e, field, section = 'main') => {
    setError(null);
    if (section === 'main') {
      setEditedMember(prev => ({
        ...prev,
        [field]: e.target.value
      }));
    } else if (section === 'guarantor') {
      setEditedMember(prev => ({
        ...prev,
        guarantor: {
          ...prev.guarantor,
          [field]: e.target.value
        }
      }));
    }
  };
  

  const handleImageChange = (e, section) => {
    const file = e.target.files[0];  // Get the selected file
  
    if (section === "photo") {
      setPhotoFile(file);  // Photo file state
    } else if (section === "guarantor") {
      // Handle multiple image uploads for the guarantor section
      switch (e.target.name) {
        case 'guarantorPhoto':
          setGuarantorPhotoFile(file);
          break;
        case 'chequePhoto':
          setChequePhotoFile(file);
          break;
        case 'extraDocument_0':
          setFileExtraDocuments_0(file);
          break;
        case 'extraDocument_1':
          setFileExtraDocuments_1(file);
          break;
        case 'extraDocument_2':
          setFileExtraDocuments_2(file);
          break;
        case 'extraDocument_3':
          setFileExtraDocuments_3(file);
          break;
        default:
          break;
      }
    }
  };
  
  

  const handleSave = async () => {
    try {
      setError(null);
      const token = localStorage.getItem("crp_token");
  
      // Prepare the updated member data for text fields
      const updateData = {
        ...member,  // Keep all original fields
        ...editedMember,  // Override with edited fields
        dateOfBirth: member.dateOfBirth,  // Preserve original dateOfBirth
        photo: photoFile,  // Preserve original photo (or the updated one)
        guarantor: {
          ...member.guarantor,  // Keep original guarantor fields
          ...editedMember.guarantor,  // Override with edited guarantor fields
          // Add image files only if they were changed
          photo: guarantorPhotoFile || member.guarantor.photo,
          chequePhoto: chequePhotoFile || member.guarantor.chequePhoto,
          extraDocuments_0: fileextraDocuments_0 || member.guarantor.extraDocuments_0,
          extraDocuments_1: fileextraDocuments_1 || member.guarantor.extraDocuments_1,
          extraDocuments_2: fileextraDocuments_2 || member.guarantor.extraDocuments_2,
          extraDocuments_3: fileextraDocuments_3 || member.guarantor.extraDocuments_3,
        },
        referredBy: member.referredBy,  // Ensure referredBy is included, use the existing one if not updated
      };
  
      // Create a FormData object
      const formData = new FormData();
  
      // Manually append fields, including guarantor details and referredBy
      formData.append("dateOfBirth", new Date(updateData.dateOfBirth).toISOString());  // Ensure correct ISO format
  
      // Append the other fields, excluding complex objects like photo, guarantor, and referredBy
      for (let key in updateData) {
        if (
          key !== "photo" &&
          key !== "dateOfBirth" &&
          key !== "_id" &&
          key !== "guarantor" &&
          key !== "referredBy"
        ) {
          formData.append(key, updateData[key]);
        }
      }
  
      // Append guarantor fields individually
      for (let key in updateData.guarantor) {
        if (updateData.guarantor[key]) { // Only append if there is a value
          formData.append(`guarantor.${key}`, updateData.guarantor[key]);
        }
      }
  
      // Append referredBy fields individually
      for (let key in updateData.referredBy) {
        if (updateData.referredBy[key]) {
          formData.append(`referredBy.${key}`, updateData.referredBy[key]);
        }
      }
  
      // If there is a new photo file, append it to FormData
      if (photoFile) {
        formData.append("photo", photoFile); // Append photo file
      }
  
      // If there are new image files for guarantor, append them to FormData
      if (guarantorPhotoFile) {
        formData.append("guarantor.photo", guarantorPhotoFile);
      }
      if (chequePhotoFile) {
        formData.append("guarantor.chequePhoto", chequePhotoFile);
      }
      if (fileextraDocuments_0) {
        formData.append("guarantor.extraDocuments_0", fileextraDocuments_0);
      }
      if (fileextraDocuments_1) {
        formData.append("guarantor.extraDocuments_1", fileextraDocuments_1);
      }
      if (fileextraDocuments_2) {
        formData.append("guarantor.extraDocuments_2", fileextraDocuments_2);
      }
      if (fileextraDocuments_3) {
        formData.append("guarantor.extraDocuments_3", fileextraDocuments_3);
      }
  
      // Log FormData content for debugging
      formData.forEach((value, key) => {
        console.log(key, value);
      });
  
      // Send PUT request with FormData
      const response = await fetch(`http://localhost:5000/api/member/${member._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData, // Send the form data (text + photo)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update member data");
      }
  
      const updatedData = await response.json();
      setMember(updatedData);
      setEditedMember({
        ...updatedData,
        guarantor: {
          ...updatedData.guarantor,
        },
      });
      setIsEditing(false);
      // Reload the current page
      window.location.reload();
    } catch (error) {
      console.error("Error updating member data:", error);
      setError(error.message || "Failed to update member data");
    }
  };
  
  
  

  

  if (!member || !editedMember) return <p className="text-center mt-10">Loading member details...</p>;

  // Rest of the component remains the same as before, but add error display:
  return (
    <div className="w-full p-0 bg-gradient-to-r from-blue-50 to-purple-100 min-h-screen">
      <div className="w-full bg-white shadow-lg rounded-lg px-4 py-5 mx-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800 mb-4">Member Details</h1>
          {isEditing ? (
            <button onClick={handleSave} className="py-2 px-4 bg-green-600 text-white rounded-full hover:bg-green-700">
              Save
            </button>
          ) : (
            <button onClick={handleEditClick} className="py-2 px-4 bg-blue-600 text-white rounded-full hover:bg-blue-700">
              Edit
            </button>
          )}
        </div>

        {/* Personal Information */}
        <div className="bg-gradient-to-r from-indigo-100 to-blue-50 p-6 rounded-xl shadow-lg border-2 border-indigo-300">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Personal Information</h2>
          <table className="min-w-full table-auto">
            <tbody className="divide-y divide-gray-200">
              {[
                { label: "ID", value: member._id, editable: false },
                { label: "Name", value: member.name, field: "name", editable: true },
                { label: "Address", value: member.address, field: "address", editable: true },
                { label: "DOB", value: new Date(member.dateOfBirth).toLocaleDateString(), editable: false },
                { label: "Aadhar", value: member.aadharNo, field: "aadharNo", editable: true },
                { label: "PAN", value: member.panNo, field: "panNo", editable: true },
                { label: "Mobile", value: member.mobileNumber, field: "mobileNumber", editable: true },
                { label: "Status", value: member.status, field: "status", editable: true },
                { label: "Photo", value: <img src={getFullImageUrl(member.photo)} alt="Member" className="h-16 w-16 rounded-full border border-gray-300" />,
                  editable: true, field: "photo", isImage: true },
              ].map((item) => (
                <tr key={item.label}>
                  <td className="py-3 px-4 font-semibold text-gray-900">{item.label}</td>
                  <td className="py-3 px-4 flex justify-between items-center">
                  {isEditing && item.editable ? (
                      item.isImage ? (
                        <input type="file" onChange={(e) => handleImageChange(e, item.field)} className="border border-gray-300 px-2 py-1 rounded w-full" />
                      ) : (
                        <input
                          type="text"
                          value={editedMember[item.field] || ""}
                          onChange={(e) => handleInputChange(e, item.field)}
                          className="border border-gray-300 px-2 py-1 rounded w-full"
                        />
                      )
                    ) : (
                      item.value
                    )}
                    {!isEditing && typeof item.value === 'string' && (
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
                  { label: "Name", value: member.guarantor.name, field: "name", editable: true },
                  { label: "Mobile", value: member.guarantor.mobileNo, field: "mobileNo", editable: true },
                  { label: "Relation", value: member.guarantor.relation, field: "relation", editable: true },
                  {
                    label: "Photo",
                    value: (
                      <img
                        src={getFullImageUrl(member.guarantor.photo)}
                        alt="Guarantor"
                        className="h-16 w-16 rounded-full border border-gray-300"
                      />
                    ),
                    editable: true, isImage:true,
                  },
                  {
                    label: "Cheque Photo",
                    value: (
                      <img
                        src={getFullImageUrl(member.guarantor.chequePhoto)}
                        alt="Cheque"
                        className="h-16 w-16 rounded-md border border-gray-300"
                      />
                    ),
                    editable: true, isImage:true,
                  },
                  {
                    label: "Document 1",
                    value: (
                      <img
                        src={getFullImageUrl(member.guarantor.extraDocuments_0)}
                        alt="Document 1"
                        className="h-16 w-16 rounded-md border border-gray-300"
                      />
                    ),
                    editable: true, isImage:true,
                  },
                  {
                    label: "Document 2",
                    value: (
                      <img
                        src={getFullImageUrl(member.guarantor.extraDocuments_1)}
                        alt="Document 2"
                        className="h-16 w-16 rounded-md border border-gray-300"
                      />
                    ),
                    editable: true, isImage:true,
                  },
                  {
                    label: "Document 3",
                    value: (
                      <img
                        src={getFullImageUrl(member.guarantor.extraDocuments_2)}
                        alt="Document 3"
                        className="h-16 w-16 rounded-md border border-gray-300"
                      />
                    ),
                    editable: true, isImage:true,
                  },
                  {
                    label: "Document 4",
                    value: (
                      <img
                        src={getFullImageUrl(member.guarantor.extraDocuments_3)}
                        alt="Document 4"
                        className="h-16 w-16 rounded-md border border-gray-300"
                      />
                    ),
                    editable: true, isImage:true,
                  },
                ].map((item) => (
                  <tr key={item.label}>
                    <td className="py-3 px-4 font-semibold text-gray-900">{item.label}</td>
                    <td className="py-3 px-4">
                    {isEditing && item.editable ? (
                      item.isImage ? (
                        <input
                          type="file"
                          // name={item.field}
                          onChange={(e) => handleImageChange(e, item.field, 'guarantor')}
                          className="border border-gray-300 px-2 py-1 rounded w-full"
                        />
                      ) : (
                        <input
                          type="text"
                          value={editedMember.guarantor[item.field] || ""}
                          onChange={(e) => handleInputChange(e, item.field, 'guarantor')}
                          className="border border-gray-300 px-2 py-1 rounded w-full"
                        />
                      )
                    ) : (
                      item.value
                  )}
                    </td>
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

        {isEditing && (
          <button
            onClick={handleSave}
            className="mt-4 py-2 px-4 bg-green-600 text-white rounded-full hover:bg-green-700"
          >
            Save
          </button>
        )}

        <button
          onClick={() => navigate("/crp/crp-members")}
          className="mb-4 mt-4 py-2 px-4 bg-blue-600 text-white rounded-full hover:bg-blue-700"
        >
          &larr; Go Back
        </button>
      </div>
    </div>
  );
};

export default CrpMemberDetails;



