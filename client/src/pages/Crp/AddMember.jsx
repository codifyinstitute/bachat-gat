import React, { useState } from 'react';
import axios from 'axios';

const AddMember = () => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        dateOfBirth: '',
        aadharNo: '',
        panNo: '',
        mobileNumber: '',
        photo: null,
        guarantorPhoto: null,
        guarantorCheque: null,
        extraDocuments: [],
        guarantor: {
            name: '',
            mobileNo: '',
            relation: '',
            extraDocuments: [],
        },
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // If it's a nested field in the 'guarantor' object, update that specific field
        if (name.startsWith('guarantor')) {
            const fieldName = name.split('[')[1].split(']')[0]; // Extract field name (e.g., name, mobileNo)
            setFormData((prevData) => ({
                ...prevData,
                guarantor: {
                    ...prevData.guarantor,
                    [fieldName]: value,
                },
            }));
        } else {
            // For non-nested fields, update directly
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: files.length ? files[0] : null,
        }));
    };

    const handleMultipleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: Array.from(files),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const form = new FormData();
    
        // Append normal fields
        form.append('name', formData.name);
        form.append('address', formData.address);
        form.append('dateOfBirth', formData.dateOfBirth);
        form.append('aadharNo', formData.aadharNo);
        form.append('panNo', formData.panNo);
        form.append('mobileNumber', formData.mobileNumber);
    
        // Append file fields
        if (formData.photo) form.append('photo', formData.photo);
        if (formData.guarantorPhoto) form.append('guarantorPhoto', formData.guarantorPhoto);
        if (formData.guarantorCheque) form.append('guarantorCheque', formData.guarantorCheque);
        formData.extraDocuments.forEach(file => form.append('extraDocuments', file));
    
        // Guarantor fields
        form.append('guarantor[name]', formData.guarantor.name);
        form.append('guarantor[mobileNo]', formData.guarantor.mobileNo);
        form.append('guarantor[relation]', formData.guarantor.relation);
        formData.guarantor.extraDocuments.forEach(file => form.append('guarantor[extraDocuments]', file));
    
        try {
            const token = localStorage.getItem("crp_token");
            console.log("token", token)
            const response = await axios.post('http://localhost:5000/api/member', form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`, // Assuming the token is stored in localStorage
                },
            });
            console.log('Member data submitted successfully', response.data);
        } catch (error) {
            console.error('Error submitting member data', error);
        }
    };
    

    return (
        <div className="flex justify-center items-center h-[100vh] bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 mt-35 mb-4pt-6 pb-6 mb-4 w-[95%] overflow-y-auto h-[90vh]">
                <h2 className="text-2xl font-semibold mb-4 text-center text-gray-700">Member Information</h2>

                {/* Member Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {/* Name */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Address */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Address</label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="text"
                            name="address"
                            placeholder="Address"
                            value={formData.address}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Date of Birth */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Date of Birth</label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Aadhar Number */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Aadhar Number</label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="text"
                            name="aadharNo"
                            placeholder="Aadhar Number"
                            value={formData.aadharNo}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* PAN Number */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">PAN Number</label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="text"
                            name="panNo"
                            placeholder="PAN Number"
                            value={formData.panNo}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Mobile Number */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Mobile Number</label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="text"
                            name="mobileNumber"
                            placeholder="Mobile Number"
                            value={formData.mobileNumber}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* File Inputs */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Photo</label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="file"
                            name="photo"
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Guarantor Photo</label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="file"
                            name="guarantorPhoto"
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Guarantor Cheque</label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="file"
                            name="guarantorCheque"
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Guarantor Information */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4">Guarantor Information</h3>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                type="text"
                                name="guarantor[name]"
                                value={formData.guarantor.name}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Mobile Number</label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                type="text"
                                name="guarantor[mobileNo]"
                                value={formData.guarantor.mobileNo}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Relation</label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                type="text"
                                name="guarantor[relation]"
                                value={formData.guarantor.relation}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Guarantor's Extra Documents</label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                type="file"
                                name="guarantor[extraDocuments]"
                                multiple
                                onChange={handleMultipleFileChange}
                            />
                        </div>
                    </div>

                    <div className="flex justify-center mb-4">
                        <button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Submit
                        </button>
                    </div>
                    </div>
                </form>
            </div>
        );
    };

export default AddMember;
