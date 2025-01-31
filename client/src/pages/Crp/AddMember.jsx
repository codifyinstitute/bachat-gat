import { useState } from "react";
import axios from "axios";

const AddMember = () => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    dateOfBirth: "",
    aadharNo: "",
    panNo: "",
    mobileNumber: "",
    photo: null,
    guarantor: {
      name: "",
      mobileNo: "",
      relation: "",
      guarantorPhoto: null,
      guarantorCheque: null,
      extraDocuments_0: null,
      extraDocuments_1: null,
      extraDocuments_2: null,
      extraDocuments_3: null,
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGuarantorChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      guarantor: { ...formData.guarantor, [name]: value },
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name.startsWith("extraDocuments")) {
      const index = name.split("_")[1];
      setFormData({
        ...formData,
        [name]: files[0],
      });
    } else {
      setFormData({ ...formData, [name]: files[0] });
    }
  };

  const validateForm = () => {
    if (!/^[0-9]{12}$/.test(formData.aadharNo)) {
      alert("Aadhar number must be 12 digits.");
      return false;
    }
    if (!/^[A-Z0-9]{10}$/.test(formData.panNo)) {
      alert("PAN number must be 10 uppercase alphanumeric characters.");
      return false;
    }
    if (!/^[0-9]{10}$/.test(formData.mobileNumber)) {
      alert("Mobile number must be 10 digits.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const token = localStorage.getItem("crp_token");
    const formDataToSend = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key === "guarantor") {
        Object.keys(formData.guarantor).forEach((gKey) => {
          formDataToSend.append(`guarantor[${gKey}]`, formData.guarantor[gKey]);
        });
      } else if (key.startsWith("extraDocuments")) {
        formDataToSend.append(key, formData[key]);
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      const res = await axios.post("http://localhost:5000/api/member", formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Member added successfully");
      console.log(res.data);
    } catch (error) {
      alert(error.response?.data?.message || "Error adding member");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-4">
      <label htmlFor="name">Name</label>
      <input
        type="text"
        name="name"
        placeholder="Name"
        onChange={handleChange}
        required
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      />
      <label htmlFor="address">Address</label>
      <input
        type="text"
        name="address"
        placeholder="Address"
        onChange={handleChange}
        required
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      />
      <label htmlFor="dateOfBirth">Date Of Birth</label>
      <input
        type="date"
        name="dateOfBirth"
        onChange={handleChange}
        required
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      />
      <label htmlFor="aadharNo">Aadhar No</label>
      <input
        type="text"
        name="aadharNo"
        placeholder="Aadhar No"
        onChange={handleChange}
        required
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      />
      <label htmlFor="panNo">PAN No</label>
      <input
        type="text"
        name="panNo"
        placeholder="PAN No"
        onChange={handleChange}
        required
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      />
      <label htmlFor="mobileNumber">Mobile Number</label>
      <input
        type="text"
        name="mobileNumber"
        placeholder="Mobile Number"
        onChange={handleChange}
        required
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      />

      <h3 className="text-lg font-semibold">Guarantor Details</h3>
      <label htmlFor="guarantorName">Guarantor Name</label>
      <input
        type="text"
        name="name"
        placeholder="Guarantor Name"
        onChange={handleGuarantorChange}
        required
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      />
      <label htmlFor="guarantorMobileNo">Guarantor Mobile No</label>
      <input
        type="text"
        name="mobileNo"
        placeholder="Guarantor Mobile"
        onChange={handleGuarantorChange}
        required
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      />
      <label htmlFor="guarantorRelation">Relation</label>
      <select
        name="relation"
        onChange={handleGuarantorChange}
        required
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select Relation</option>
        <option value="Father">Father</option>
        <option value="Mother">Mother</option>
        <option value="Sibling">Sibling</option>
      </select>

      <h3 className="text-lg font-semibold">Upload Documents</h3>
      <input
        type="file"
        name="photo"
        onChange={handleFileChange}
        required
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      />
      <label htmlFor="guarantorPhoto">Guarantor Photo</label>
      <input
        type="file"
        name="guarantorPhoto"
        onChange={handleFileChange}
        required
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      />
      <label htmlFor="guarantorCheque">Guarantor Cheque</label>
      <input
        type="file"
        name="guarantorCheque"
        onChange={handleFileChange}
        required
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      />

      <h3>Extra Documents (Images)</h3>
      <input
        type="file"
        name="extraDocuments_0"
        onChange={handleFileChange}
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="file"
        name="extraDocuments_1"
        onChange={handleFileChange}
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="file"
        name="extraDocuments_2"
        onChange={handleFileChange}
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="file"
        name="extraDocuments_3"
        onChange={handleFileChange}
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      />

      <button
        type="submit"
        className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Add Member
      </button>
    </form>
  );
};

export default AddMember;
