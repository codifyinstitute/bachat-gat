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
  const [selectedImage, setSelectedImage] = useState(null);

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
        setEditedMember({
          ...data,
          name: data.name || "",
          address: data.address || "",
          aadharNo: data.aadharNo || "",
          panNo: data.panNo || "",
          mobileNumber: data.mobileNumber || "",
          status: data.status || "",
          dateOfBirth: data.dateOfBirth,
          photo: data.photo || "",
          guarantor: {
            name: data.guarantor?.name || "",
            mobileNo: data.guarantor?.mobileNo || "",
            relation: data.guarantor?.relation || "",
            guarantorPhoto: data.guarantor?.photo || "",
            guarantorCheque: data.guarantor?.chequePhoto || "",
            extraDocuments_0: data.guarantor?.extraDocuments_0 || "",
            extraDocuments_1: data.guarantor?.extraDocuments_1 || "",
            extraDocuments_2: data.guarantor?.extraDocuments_2 || "",
            extraDocuments_3: data.guarantor?.extraDocuments_3 || "",
          },
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
    const relativePath = imagePath
      .replace(/\\/g, "/")
      .replace(/^.*?uploads\//, "uploads/");
    return `http://localhost:5000/${relativePath}`;
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleInputChange = (e, field, section = "main") => {
    setError(null);
    if (section === "main") {
      setEditedMember((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    } else if (section === "guarantor") {
      setEditedMember((prev) => ({
        ...prev,
        guarantor: {
          ...prev.guarantor,
          [field]: e.target.value,
        },
      }));
    }
  };

  const handleImageChange = (e, section) => {
    const file = e.target.files[0];
    if (!file) return; // Prevent errors if no file is selected

    if (section === "photo") {
      setPhotoFile(file);
    } else if (section === "guarantor") {
      switch (e.target.name) {
        case "guarantorPhoto":
          setGuarantorPhotoFile(file.name);
          break;
        case "guarantorCheque":
          setChequePhotoFile(file);
          break;
        case "extraDocuments_0":
          setFileExtraDocuments_0(file);
          break;
        case "extraDocuments_1":
          setFileExtraDocuments_1(file);
          break;
        case "extraDocuments_2":
          setFileExtraDocuments_2(file);
          break;
        case "extraDocuments_3":
          setFileExtraDocuments_3(file);
          break;
        default:
          break;
      }
    }
    // console.log("Updated File:", file.name); // Log the actual selected file
  };

  const handleSave = async () => {
    try {
      setError(null);
      const token = localStorage.getItem("crp_token");

      const formData = new FormData();
      formData.append(
        "dateOfBirth",
        new Date(editedMember.dateOfBirth).toISOString()
      );

      Object.keys(editedMember).forEach((key) => {
        if (
          !["photo", "dateOfBirth", "_id", "guarantor", "referredBy"].includes(
            key
          )
        ) {
          formData.append(key, editedMember[key]);
        }
      });

      Object.entries(editedMember.guarantor).forEach(([key, value]) => {
        if (value) {
          formData.append(`guarantor.${key}`, value);
        }
      });

      if (photoFile) formData.append("photo", photoFile);
      if (guarantorPhotoFile)
        formData.append("guarantor.guarantorPhoto", guarantorPhotoFile);
      if (chequePhotoFile)
        formData.append("guarantor.guarantorCheque", chequePhotoFile);
      if (fileextraDocuments_0)
        formData.append("guarantor.extraDocuments_0", fileextraDocuments_0);
      if (fileextraDocuments_1)
        formData.append("guarantor.extraDocuments_1", fileextraDocuments_1);
      if (fileextraDocuments_2)
        formData.append("guarantor.extraDocuments_2", fileextraDocuments_2);
      if (fileextraDocuments_3)
        formData.append("guarantor.extraDocuments_3", fileextraDocuments_3);

      const response = await fetch(
        `http://localhost:5000/api/member/${member._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const updatedData = await response.json();
        if (response.ok) {
          setMember(updatedData);
          setEditedMember({
            ...updatedData,
            guarantor: { ...updatedData.guarantor },
          });
          setIsEditing(false);
          window.location.reload()
        } else {
          throw new Error(
            updatedData.message || "Failed to update member data"
          );
        }
      } else {
        const rawText = await response.text();
        console.error("Unexpected response:", rawText);
        throw new Error("Server returned an unexpected response.");
      }
    } catch (error) {
      console.error("Error updating member data:", error);
      setError(error.message || "Failed to update member data");
    }
  };

  const handleImageClick = (imagePath) => {
    setSelectedImage(getFullImageUrl(imagePath));
  };

  const ImageComponent = ({ src, alt, className }) => (
    <img
      src={src}
      alt={alt}
      className={`${className} cursor-pointer hover:opacity-80 transition-opacity`}
      onClick={() => handleImageClick(src)}
    />
  );

  if (!member || !editedMember)
    return <p className="text-center mt-10">Loading member details...</p>;

  return (
    <div className="w-full p-0 bg-gradient-to-r from-blue-50 to-purple-100 min-h-screen mt-10 md:mt-4 lg:mt-2">
      <div className="w-full bg-white shadow-lg rounded-lg px-4 py-5 mx-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <div className="flex justify-between items-center ">
          <h1 className="text-xl font-bold text-gray-800 mb-4">
            Member Details
          </h1>
          {isEditing ? (
            <button
              onClick={handleSave}
              className="py-2 px-4 bg-green-600 text-white rounded-full hover:bg-green-700"
            >
              Save
            </button>
          ) : (
            <button
              onClick={handleEditClick}
              className="py-2 px-4 bg-blue-600 text-white rounded-full hover:bg-blue-700"
            >
              Edit
            </button>
          )}
        </div>

        {/* Personal Information */}
        <div className="bg-gradient-to-r from-indigo-100 to-blue-50 p-6 rounded-xl shadow-lg border-2 border-indigo-300">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Personal Information
          </h2>
          <table className="min-w-full table-auto">
            <tbody className="divide-y divide-gray-200">
              {[
                { label: "ID", value: member._id, editable: false },
                {
                  label: "Name",
                  value: member.name,
                  field: "name",
                  editable: true,
                },
                {
                  label: "Address",
                  value: member.address,
                  field: "address",
                  editable: true,
                },
                {
                  label: "DOB",
                  value: new Date(member.dateOfBirth).toLocaleDateString(),
                  editable: false,
                },
                {
                  label: "Aadhar",
                  value: member.aadharNo,
                  field: "aadharNo",
                  editable: true,
                },
                {
                  label: "PAN",
                  value: member.panNo,
                  field: "panNo",
                  editable: true,
                },
                {
                  label: "Mobile",
                  value: member.mobileNumber,
                  field: "mobileNumber",
                  editable: true,
                },
                {
                  label: "Status",
                  value: member.status,
                  field: "status",
                },
                {
                  label: "Photo",
                  value: (
                    <>
                      <ImageComponent
                        src={getFullImageUrl(member.photo)}
                        alt="Member"
                        className="h-16 w-16 rounded-full border border-gray-300"
                      />
                      {selectedImage && (
                        <ImageModal
                          imageUrl={selectedImage}
                          onClose={() => setSelectedImage(null)}
                        />
                      )}
                    </>
                  ),
                  field: "photo",
                  isImage: true,
                },
              ].map((item) => (
                <tr key={item.label}>
                  <td className="py-3 px-4 font-semibold text-gray-900">
                    {item.label}
                  </td>
                  <td className="py-3 px-4 flex justify-between items-center">
                    {item.label === "ID" ? (
                      <>
                        {/* For small screens, show truncated ID */}
                        <span className="md:hidden">{member._id.substring(0, 4) + '...'}</span>
                        {/* For medium screens and up, show full ID */}
                        <span className="hidden md:inline">{member._id}</span>
                      </>
                    ) : isEditing && item.editable ? (
                      item.isImage ? (
                        <input
                          type="file"
                          onChange={(e) => handleImageChange(e, item.field)}
                          className="border border-gray-300 px-2 py-1 rounded w-full"
                        />
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

                    {!isEditing && typeof item.value === "string" && (
                      <button onClick={() => handleCopy(item.value, item.label)}>
                        <Copy className="w-5 h-5 text-gray-600 hover:text-gray-800 ml-2" />
                      </button>
                    )}
                    {copiedField === item.label && (
                      <span className="text-green-600 ml-2 text-sm">Copied!</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>

        {/* Guarantor Section */}
        {member.guarantor && (
          <div className="bg-gradient-to-r from-red-100 to-orange-50 mt-6 p-6 rounded-xl shadow-lg border-2 border-red-300">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Guarantor Information
            </h2>
            <table className="min-w-full table-auto">
              <tbody className="divide-y divide-gray-200">
                {[
                  {
                    label: "Name",
                    value: member.guarantor.name,
                    field: "name",
                    editable: true,
                  },
                  {
                    label: "Mobile",
                    value: member.guarantor.mobileNo,
                    field: "mobileNo",
                    editable: true,
                  },
                  {
                    label: "Relation",
                    value: member.guarantor.relation,
                    field: "relation",
                    editable: true,
                  },
                  {
                    label: "Photo",
                    value: (
                      <ImageComponent
                        src={member.guarantor.photo ? getFullImageUrl(member.guarantor.photo) : "https://dummyimage.com/300"}
                        alt="Guarantor"
                        className="h-16 w-16 rounded-full border border-gray-300"
                      />
                    ),
                    isImage: true,
                    field: "guarantorPhoto",
                  },
                  {
                    label: "Cheque Photo",
                    value: (
                      <ImageComponent
                        src={member.guarantor.chequePhoto ? getFullImageUrl(member.guarantor.chequePhoto) : "https://dummyimage.com/300"}
                        alt="Cheque"
                        className="h-16 w-16 rounded-md border border-gray-300"
                      />
                    ),
                    isImage: true,
                    field: "guarantorCheque",
                  },
                  {
                    label: "Document 1",
                    value: (
                      <ImageComponent
                        src={member.guarantor.extraDocuments_0 ? getFullImageUrl(member.guarantor.extraDocuments_0) : "https://dummyimage.com/300"}
                        alt="Document 1"
                        className="h-16 w-16 rounded-md border border-gray-300"
                      />
                    ),
                    isImage: true,
                    field: "extraDocuments_0",
                  },
                  {
                    label: "Document 2",
                    value: (
                      <ImageComponent
                        src={member.guarantor.extraDocuments_1 ? getFullImageUrl(member.guarantor.extraDocuments_1) : "https://dummyimage.com/300"}
                        alt="Document 2"
                        className="h-16 w-16 rounded-md border border-gray-300"
                      />
                    ),
                    isImage: true,
                    field: "extraDocuments_1",
                  },
                  {
                    label: "Document 3",
                    value: (
                      <ImageComponent
                        src={member.guarantor.extraDocuments_2 ? getFullImageUrl(member.guarantor.extraDocuments_2) : "https://dummyimage.com/300"}
                        alt="Document 3"
                        className="h-16 w-16 rounded-md border border-gray-300"
                      />
                    ),
                    isImage: true,
                    field: "extraDocuments_2",
                  },
                  {
                    label: "Document 4",
                    value: (
                      <ImageComponent
                        src={member.guarantor.extraDocuments_3 ? getFullImageUrl(member.guarantor.extraDocuments_3) : "https://dummyimage.com/300"}
                        alt="Document 4"
                        className="h-16 w-16 rounded-md border border-gray-300"
                      />
                    ),
                    isImage: true,
                    field: "extraDocuments_3",
                  },
                  
                ].map((item) => (
                  <tr key={item.label}>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {item.label}
                    </td>
                    <td className="py-3 px-4">
                      {isEditing && item.editable ? (
                        item.isImage ? (
                          <div>
                            <input
                              type="file"
                              name={item.field}
                              onChange={(e) =>
                                handleImageChange(e, "guarantor")
                              }
                              className="border border-gray-300 px-2 py-1 rounded w-full"
                              multiple={false}
                            />
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={editedMember.guarantor[item.field] || ""}
                            onChange={(e) =>
                              handleInputChange(e, item.field, "guarantor")
                            }
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
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Account Activity
          </h2>
          <table className="min-w-full table-auto">
            <tbody className="divide-y divide-gray-200">
              {[
                {
                  label: "Created At",
                  value: new Date(member.createdAt).toLocaleDateString(),
                },
                {
                  label: "Updated At",
                  value: new Date(member.updatedAt).toLocaleDateString(),
                },
              ].map((item) => (
                <tr key={item.label}>
                  <td className="py-3 px-4 font-semibold text-gray-900">
                    {item.label}
                  </td>
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
