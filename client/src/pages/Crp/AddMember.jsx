import { useState, useEffect } from "react";
import axios from "axios";

const AddMember = () => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    dateOfBirth: "",
    aadharNo: "",
    panNo: "",
    accNo: "",
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

  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let error = "";
    if (name === "aadharNo" && !/^[0-9]{12}$/.test(value)) {
      error = "Aadhar number must be 12 digits.";
    } else if (name === "panNo" && !/^[A-Z0-9]{10}$/.test(value)) {
      error = "PAN number must be 10 uppercase alphanumeric characters.";
    } else if (name === "mobileNumber" && !/^[0-9]{10}$/.test(value)) {
      error = "Mobile number must be 10 digits.";
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleGuarantorChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      guarantor: { ...formData.guarantor, [name]: value },
    });
    const error = validateField(name, value);
    setErrors({ ...errors, [`guarantor.${name}`]: error });
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

  useEffect(() => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (key !== "guarantor" && key !== "photo") {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });
    Object.keys(formData.guarantor).forEach((key) => {
      const error = validateField(key, formData.guarantor[key]);
      if (error) newErrors[`guarantor.${key}`] = error;
    });
    setErrors(newErrors);
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) {
      alert("Please fix the errors in the form.");
      return;
    }

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
      const res = await axios.post(
        "http://localhost:5000/api/member",
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Member added successfully");
      // console.log(res.data);
      // window.location.reload();
    } catch (error) {
      alert(error.response?.data?.message || "Error adding member");
    }
  };

  return (
    <div className="w-full h-[100vh] overflow-y-auto ">
      <h1 className="text-2xl mt-4 ml-16">Add Member</h1>
      <form
        onSubmit={handleSubmit}
        className=" w-full mx-auto p-6 bg-white rounded-lg shadow-lg space-y-4 md:w-[95%] lg:w-[90%] mt-8"
      >

        
        <div className="w-full md:flex md:gap-4">
          <div className="mb-4 lg:w-[50%]">
            <label htmlFor="guarantorPhoto"> Photo <span className="text-gray-500">(ONLY .JPEG, .JPG, .PNG)</span></label>
            <input
              type="file"
              name="photo"
              onChange={handleFileChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {errors.photo && <p className="text-red-500">{errors.photo}</p>}
          </div>
          <div className="mb-4 lg:w-[50%]">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 "
            />
            {errors.name && <p className="text-red-500">{errors.name}</p>}
          </div>
          
        </div>

        <div className="w-full md:flex md:gap-4">
          <div className="lg:w-[50%]">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              name="address"
              placeholder="Full Address"
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {errors.address && <p className="text-red-500">{errors.address}</p>}
          </div>
          <div className="mb-4 lg:w-[50%]">
            <label htmlFor="dateOfBirth">Date Of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {errors.dateOfBirth && (
              <p className="text-red-500">{errors.dateOfBirth}</p>
            )}
          </div>
          
        </div>

        <div className="w-full md:flex md:gap-4">
          <div className="lg:w-[50%]">
            <label htmlFor="aadharNo">Aadhar No</label>
            <input
              type="text"
              name="aadharNo"
              placeholder="12-digit Aadhar No"
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {errors.aadharNo && (
              <p className="text-red-500">{errors.aadharNo}</p>
            )}
          </div>
          <div className="mb-4 md:w-[70%] lg:w-[50%]">
            <label htmlFor="panNo">PAN No</label>
            <input
              type="text"
              name="panNo"
              placeholder="10-character PAN No"
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {errors.panNo && <p className="text-red-500">{errors.panNo}</p>}
          </div>
          
        </div>
        <div className="w-full md:flex md:gap-4">
        <div className="mb-4 md:w-[70%] lg:w-[50%]">
            <label htmlFor="accNo">Acc No</label>
            <input
              type="text"
              name="accNo"
              placeholder="Account No"
              onChange={handleChange}
              // required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {errors.accNo && <p className="text-red-500">{errors.accNo}</p>}
          </div>
          <div className="lg:w-[50%]">
            <label htmlFor="mobileNumber">Mobile Number</label>
            <input
              type="text"
              name="mobileNumber"
              placeholder="10-digit Mobile No"
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {errors.mobileNumber && (
              <p className="text-red-500">{errors.mobileNumber}</p>
            )}
          </div>
        </div>

        <div className="w-full md:flex md:flex-col md:gap-4">
          <h3 className="text-lg font-semibold">Guarantor Details</h3>
          <div className="md:flex gap-4 ">
            <div className="mb-4 lg:w-[50%]">
              <label htmlFor="guarantorName">Guarantor Name</label>
              <input
                type="text"
                name="name"
                placeholder="Guarantor Full Name"
                onChange={handleGuarantorChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              {errors["guarantor.name"] && (
                <p className="text-red-500">{errors["guarantor.name"]}</p>
              )}
            </div>
            <div className="lg:w-[50%]">
              <label htmlFor="guarantorMobileNo">Guarantor Mobile No</label>
              <input
                type="text"
                name="mobileNo"
                placeholder="10-digit Mobile No"
                onChange={handleGuarantorChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              {errors["guarantor.mobileNo"] && (
                <p className="text-red-500">{errors["guarantor.mobileNo"]}</p>
              )}
            </div>
          </div>
        </div>

        <div className="w-full md:flex md:gap-4">
          <div className="mb-4 md:w-[75%] lg:w-[50%]">
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
              <option value="Husband">Husband</option>
              <option value="Son">Son</option>
              <option value="Daughter">Daughter</option>
              <option value="Brother">Brother</option>
              <option value="Sister">Sister</option>
            </select>
            {errors["guarantor.relation"] && (
              <p className="text-red-500">{errors["guarantor.relation"]}</p>
            )}
          </div>
          
        </div>
        <div className="w-full md:flex md:flex-col md:gap-4">
          <h3 className="text-lg font-semibold">Upload Documents</h3>
          <div className="md:flex gap-4">
            <div className="mb-4 lg:w-[50%]">
              <label htmlFor="guarantorPhoto">Guarantor Photo<span className="text-gray-500">(ONLY .JPEG, .JPG, .PNG)</span></label>
              <input
                type="file"
                name="guarantorPhoto"
                placeholder=".jpg, .jpeg., .png format only "
                onChange={handleFileChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              {errors["guarantor.guarantorPhoto"] && (
                <p className="text-red-500">
                  {errors["guarantor.guarantorPhoto"]}
                </p>
              )}
            </div>
            <div className="mb-4 lg:w-[50%]">
              <label htmlFor="guarantorCheque">Guarantor Cheque<span className="text-gray-500">(ONLY .JPEG, .JPG, .PNG)</span></label>
              <input
                type="file"
                name="guarantorCheque"
                placeholder=".jpg, .jpeg., .png format only "
                onChange={handleFileChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              {errors["guarantor.guarantorCheque"] && (
                <p className="text-red-500">
                  {errors["guarantor.guarantorCheque"]}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="w-full  md:flex md:flex-col md:gap-4">
          <h3>Extra Documents (Images)</h3>
          <div className="md:flex flex-wrap md:gap-4">
            <div className="mb-4 md:w-[48%]">
            <label htmlFor="">Document 1<span className="text-gray-500">(ONLY .JPEG, .JPG, .PNG)</span></label>
              <input
                type="file"
                name="extraDocuments_0"
                placeholder=".jpg, .jpeg., .png format only "
                onChange={handleFileChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              {errors.extraDocuments_0 && (
                <p className="text-red-500">{errors.extraDocuments_0}</p>
              )}
            </div>
            <div className="mb-4 md:w-[48%]">
              <label htmlFor="">Document 2<span className="text-gray-500">(ONLY .JPEG, .JPG, .PNG)</span></label>
              <input
                type="file"
                name="extraDocuments_1"
                placeholder=".jpg, .jpeg., .png format only "
                onChange={handleFileChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              {errors.extraDocuments_1 && (
                <p className="text-red-500">{errors.extraDocuments_1}</p>
              )}
            </div>
            <div className="mb-4 md:w-[48%]">
            <label htmlFor="">Document 3<span className="text-gray-500">(ONLY .JPEG, .JPG, .PNG)</span></label>
              <input
                type="file"
                name="extraDocuments_2"
                placeholder=".jpg, .jpeg., .png format only "
                onChange={handleFileChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              {errors.extraDocuments_2 && (
                <p className="text-red-500">{errors.extraDocuments_2}</p>
              )}
            </div>
            <div className="mb-4 md:w-[48%]">
            <label htmlFor="">Document 4<span className="text-gray-500">(ONLY .JPEG, .JPG, .PNG)</span></label>
              <input
                type="file"
                placeholder=".jpg, .jpeg., .png format only "
                name="extraDocuments_3"
                onChange={handleFileChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              {errors.extraDocuments_3 && (
                <p className="text-red-500">{errors.extraDocuments_3}</p>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add Member
        </button>
      </form>
    </div>
  );
};

export default AddMember;
