import React, { useState } from 'react';
import axios from 'axios';

const AddMember = () => {
    const [errors, setErrors] = useState({});

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
        guarantor: {
            name: '',
            mobileNo: '',
            relation: '',
            extraDocuments: [],
            
        },
    });

    const relationOptions = [
        'Father',
        'Mother',
        'Brother',
        'Sister',
        'Son',
        'Daughter',
        'Husband',
        'Wife',
        'other',
    ];

    const validateField = (name, value) => {
        switch (name) {
            case 'name':
            case 'guarantor[name]':
                return value.trim().length < 3 ? 'Name must be at least 3 characters long' : '';
            case 'address':
                return value.trim().length < 10 ? 'Address must be at least 10 characters long' : '';
            case 'dateOfBirth': 
                return value.trim().length < 0 ? 'Member must be at least 18 years old' : '';
            case 'aadharNo':
                return !/^\d{12}$/.test(value) ? 'Aadhar number must be 12 digits' : '';
            case 'panNo':
                return !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value) ? 'Invalid PAN number format' : '';
            case 'mobileNumber':
            case 'guarantor[mobileNo]':
                return !/^[6-9]\d{9}$/.test(value) ? 'Invalid mobile number' : '';
            default:
                return '';
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
    
        if (name.startsWith("guarantor.")) {
            const field = name.split(".")[1];
            setFormData((prev) => ({
                ...prev,
                guarantor: {
                    ...prev.guarantor,
                    [field]: value,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    
        const error = validateField(name, value);
        setErrors((prev) => ({
            ...prev,
            [name]: error,
        }));
    };
    

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (!files[0]) return;
    
        const file = files[0];
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    
        if (!allowedTypes.includes(file.type)) {
            setErrors((prev) => ({
                ...prev,
                [name]: 'Please upload only JPG, JPEG, or PNG files',
            }));
            return;
        }
    
        if (file.size > maxSize) {
            setErrors((prev) => ({
                ...prev,
                [name]: 'File size should not exceed 5MB',
            }));
            return;
        }
    
        if (name.startsWith('guarantor.extraDocuments')) {
            const index = parseInt(name.split('.')[2].replace('extraDoc', ''), 10) - 1;
            setFormData((prev) => {
                const updatedDocs = [...prev.guarantor.extraDocuments];
                updatedDocs[index] = file;  // Correct file assignment
                return {
                    ...prev,
                    guarantor: {
                        ...prev.guarantor,
                        extraDocuments: updatedDocs,
                    },
                };
            });
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: file,
            }));
        }
    
        setErrors((prev) => ({
            ...prev,
            [name]: '',
        }));
    };
    
    

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        let newErrors = {};
        Object.entries(formData).forEach(([key, value]) => {
            if (typeof value === 'string') {
                const error = validateField(key, value);
                if (error) newErrors[key] = error;
            }
        });
    
        Object.entries(formData.guarantor).forEach(([key, value]) => {
            if (typeof value === 'string') {
                const error = validateField(`guarantor.${key}`, value);
                if (error) newErrors[`guarantor.${key}`] = error;
            }
        });
    
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
    
        const form = new FormData();
    
        // Append member fields
        form.append('name', formData.name);
        form.append('address', formData.address);
        form.append('dateOfBirth', formData.dateOfBirth);
        form.append('aadharNo', formData.aadharNo);
        form.append('panNo', formData.panNo);
        form.append('mobileNumber', formData.mobileNumber);
    
        // Append member files
        if (formData.photo) form.append('photo', formData.photo);
        if (formData.guarantorPhoto) form.append('guarantorPhoto', formData.guarantorPhoto);
        if (formData.guarantorCheque) form.append('guarantorCheque', formData.guarantorCheque);
    
        // Append guarantor fields
        form.append('guarantor.name', formData.guarantor.name);
        form.append('guarantor.mobileNo', formData.guarantor.mobileNo);
        form.append('guarantor.relation', formData.guarantor.relation);
    
        // Append guarantor extra documents
        formData.guarantor.extraDocuments.forEach((doc, index) => {
            if (doc) form.append(`guarantor.extraDocuments[${index}]`, doc);
        });
    
        try {
            const token = localStorage.getItem("crp_token");
            const response = await axios.post('http://localhost:5000/api/member', form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
            });
            console.log('Member added successfully:', response.data);
            // Add success message or redirect here
        } catch (error) {
            console.error('Error adding member:', error);
            setErrors((prev) => ({
                ...prev,
                submit: 'Failed to add member. Please try again.',
            }));
        }
    };
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 py-6">
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-[95%] max-w-6xl">
                <h2 className="text-2xl font-semibold mb-6 text-center text-gray-700">Member Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Member Details */}
                    <div className="mb-0 sm:mb-2 md:mb-2 lg:mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Name *</label>
                        <input
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.name ? 'border-red-500' : ''}`}
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                        {errors.name && <p className="text-red-500 text-xs italic">{errors.name}</p>}
                    </div>

                    <div className="mb-0 sm:mb-2 md:mb-2 lg:mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Address *</label>
                        <input
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.address ? 'border-red-500' : ''}`}
                            type="text"
                            name="address"
                            placeholder="Address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                        />
                        {errors.address && <p className="text-red-500 text-xs italic">{errors.address}</p>}
                    </div>

                    <div className="mb-0 sm:mb-2 md:mb-2 lg:mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Date of Birth *</label>
                        <input
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            required
                        />
                        {errors.dateOfBirth && <p className="text-red-500 text-xs italic">{errors.dateOfBirth}</p>}
                    </div>

                    <div className="mb-0 sm:mb-2 md:mb-2 lg:mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Aadhar Number *</label>
                        <input
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.aadharNo ? 'border-red-500' : ''}`}
                            type="text"
                            name="aadharNo"
                            placeholder="12-digit Aadhar Number"
                            value={formData.aadharNo}
                            onChange={handleInputChange}
                            required
                        />
                        {errors.aadharNo && <p className="text-red-500 text-xs italic">{errors.aadharNo}</p>}
                    </div>

                    <div className="mb-0 sm:mb-2 md:mb-2 lg:mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">PAN Number *</label>
                        <input
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.panNo ? 'border-red-500' : ''}`}
                            type="text"
                            name="panNo"
                            placeholder="PAN Number"
                            value={formData.panNo}
                            onChange={handleInputChange}
                            required
                        />
                        {errors.panNo && <p className="text-red-500 text-xs italic">{errors.panNo}</p>}
                    </div>

                    <div className="mb-0 sm:mb-2 md:mb-2 lg:mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Mobile Number *</label>
                        <input
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.mobileNumber ? 'border-red-500' : ''}`}
                            type="text"
                            name="mobileNumber"
                            placeholder="10-digit Mobile Number"
                            value={formData.mobileNumber}
                            onChange={handleInputChange}
                            required
                        />
                        {errors.mobileNumber && <p className="text-red-500 text-xs italic">{errors.mobileNumber}</p>}
                    </div>

                    <div className="mb-0 sm:mb-2 md:mb-2 lg:mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Photo *</label>
                        <input
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.photo ? 'border-red-500' : ''}`}
                            type="file"
                            name="photo"
                            onChange={handleFileChange}
                            accept="image/*"
                            required
                        />
                        {errors.photo && <p className="text-red-500 text-xs italic">{errors.photo}</p>}
                    </div>

                    <div className="mb-0 sm:mb-2 md:mb-2 lg:mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Guarantor Photo *</label>
                        <input
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.guarantorPhoto ? 'border-red-500' : ''}`}
                            type="file"
                            name="guarantorPhoto"
                            onChange={handleFileChange}
                            accept="image/*"
                            required
                        />
                        {errors.guarantorPhoto && <p className="text-red-500 text-xs italic">{errors.guarantorPhoto}</p>}
                    </div>

                    <div className="mb-0 sm:mb-2 md:mb-2 lg:mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Guarantor Cheque *</label>
                        <input
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.guarantorCheque ? 'border-red-500' : ''}`}
                            type="file"
                            name="guarantorCheque"
                            onChange={handleFileChange}
                            accept="image/*"
                            required
                        />
                        {errors.guarantorCheque && <p className="text-red-500 text-xs italic">{errors.guarantorCheque}</p>}
                    </div>

                    {/* Guarantor Information Section */}
                    <div className="col-span-full">
                        <h3 className="text-xl font-semibold mb-4 text-gray-700 mt-6">Guarantor Information</h3>
                    </div>

                    <div className="mb-0 sm:mb-2 md:mb-2 lg:mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Guarantor Name *</label>
                        <input
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors['guarantor[name]'] ? 'border-red-500' : ''}`}
                            type="text"
                            name="guarantor.name"
                            placeholder="Guarantor's Full Name"
                            value={formData.guarantor.name}
                            onChange={handleInputChange}
                            required
                        />
                        {errors['guarantor.name'] && <p className="text-red-500 text-xs italic">{errors['guarantor.name']}</p>}
                    </div>

                    <div className="mb-0 sm:mb-2 md:mb-2 lg:mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Guarantor Mobile Number *</label>
                        <input
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors['guarantor[mobileNo]'] ? 'border-red-500' : ''}`}
                            type="text"
                            name="guarantor.mobileNo"
                            placeholder="10-digit Mobile Number"
                            value={formData.guarantor.mobileNo}
                            onChange={handleInputChange}
                            required
                        />
                        {errors['guarantor.mobileNo'] && <p className="text-red-500 text-xs italic">{errors['guarantor.mobileNo']}</p>}
                    </div>

                    <div className="mb-0 sm:mb-2 md:mb-2 lg:mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Relation *</label>
                        <select
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors['guarantor[relation]'] ? 'border-red-500' : ''}`}
                            name="guarantor.relation"
                            value={formData.guarantor.relation}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select Relation</option>
                            {relationOptions.map((relation) => (
                                <option key={relation} value={relation}>
                                    {relation}
                                </option>
                            ))}
                        </select>
                        {errors['guarantor.relation'] && <p className="text-red-500 text-xs italic">{errors['guarantor.relation']}</p>}
                    </div>

                    {/* Guarantor Extra Documents */}
                    <div className="mb-0 sm:mb-2 md:mb-2 lg:mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Extra Document 1</label>
                        <input
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors['guarantor[extraDoc1]'] ? 'border-red-500' : ''}`}
                            type="file"
                            name="guarantor.extraDocuments"
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                        {errors['guarantor.extraDocuments'] && <p className="text-red-500 text-xs italic">{errors['guarantor.extraDoc1']}</p>}
                    </div>

                    <div className="mb-0 sm:mb-2 md:mb-2 lg:mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Extra Document 2</label>
                        <input
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors['guarantor[extraDoc2]'] ? 'border-red-500' : ''}`}
                            type="file"
                            name="guarantor.extraDoc2"
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                        {errors['guarantor.extraDocuments'] && <p className="text-red-500 text-xs italic">{errors['guarantor.extraDoc2']}</p>}
                    </div>

                    <div className="mb-0 sm:mb-2 md:mb-2 lg:mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Extra Document 3</label>
                        <input
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors['guarantor[extraDoc3]'] ? 'border-red-500' : ''}`}
                            type="file"
                            name="guarantor.extraDocuments"
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                        {errors['guarantor.extraDocuments'] && <p className="text-red-500 text-xs italic">{errors['guarantor.extraDoc3']}</p>}
                    </div>

                    <div className="mb-0 sm:mb-2 md:mb-2 lg:mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Extra Document 4</label>
                        <input
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors['guarantor[extraDoc3]'] ? 'border-red-500' : ''}`}
                            type="file"
                            name="guarantor.extraDocuments"
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                        {errors['guarantor.extraDoc4'] && <p className="text-red-500 text-xs italic">{errors['guarantor.extraDoc4']}</p>}
                    </div>
                </div>

                <div className="flex justify-center mt-8">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded focus:outline-none focus:shadow-outline transition duration-300"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddMember;