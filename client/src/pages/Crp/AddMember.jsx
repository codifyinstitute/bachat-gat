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
            extraDocuments: [{
                extraDoc1: null,
                extraDoc2: null,
                extraDoc3: null,
                extraDoc4:null
            }],
            
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
                const age = calculateAge(value);
                return age < 18 ? 'Member must be at least 18 years old' : '';
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

    const calculateAge = (birthDate) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name.startsWith('guarantor')) {
            const fieldName = name.split('[')[1].split(']')[0];
            setFormData(prevData => ({
                ...prevData,
                guarantor: {
                    ...prevData.guarantor,
                    [fieldName]: value,
                },
            }));
            // Validate guarantor fields
            const error = validateField(name, value);
            setErrors(prev => ({
                ...prev,
                [name]: error
            }));
        } else {
            setFormData(prevData => ({
                ...prevData,
                [name]: value,
            }));
            // Validate main fields
            const error = validateField(name, value);
            setErrors(prev => ({
                ...prev,
                [name]: error
            }));
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];
        
        if (file && !['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
            setErrors(prev => ({
                ...prev,
                [name]: 'Please upload only JPG, JPEG or PNG files'
            }));
            return;
        }

        if (file && file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({
                ...prev,
                [name]: 'File size should not exceed 5MB'
            }));
            return;
        }

        if (name.startsWith('guarantor')) {
            const fieldName = name.split('[')[1].split(']')[0];
            setFormData(prevData => ({
                ...prevData,
                guarantor: {
                    ...prevData.guarantor,
                    [fieldName]: file
                }
            }));
        } else {
            setFormData(prevData => ({
                ...prevData,
                [name]: file
            }));
        }

        // Clear error if file is valid
        setErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };

    const handleMultipleFileChange = (e) => {
        const { name, files } = e.target;
        const fileList = Array.from(files);
        
        // Validate each file
        const invalidFiles = fileList.filter(file => 
            !['image/jpeg', 'image/png', 'image/jpg'].includes(file.type) || 
            file.size > 5 * 1024 * 1024
        );

        if (invalidFiles.length > 0) {
            setErrors(prev => ({
                ...prev,
                [name]: 'Some files are invalid. Please check file types and sizes'
            }));
            return;
        }

        setFormData(prevData => ({
            ...prevData,
            guarantor: {
                ...prevData.guarantor,
                extraDocuments: [...prevData.guarantor.extraDocuments, ...fileList]
            }
        }));

        // Clear error if all files are valid
        setErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate all fields before submission
        let newErrors = {};
        Object.entries(formData).forEach(([key, value]) => {
            if (typeof value === 'string') {
                const error = validateField(key, value);
                if (error) newErrors[key] = error;
            }
        });

        Object.entries(formData.guarantor).forEach(([key, value]) => {
            if (typeof value === 'string') {
                const error = validateField(`guarantor[${key}]`, value);
                if (error) newErrors[`guarantor[${key}]`] = error;
            }
        });

        // Required file validations
        if (!formData.photo) newErrors.photo = 'Photo is required';
        if (!formData.guarantorPhoto) newErrors.guarantorPhoto = 'Guarantor photo is required';
        if (!formData.guarantorCheque) newErrors.guarantorCheque = 'Guarantor cheque is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const form = new FormData();

        // Append normal fields
        Object.entries(formData).forEach(([key, value]) => {
            if (!key.startsWith('guarantor')) {
                if (Array.isArray(value)) {
                    value.forEach(file => form.append(key, file));
                } else {
                    form.append(key, value);
                }
            }
        });

        // Append guarantor fields
        Object.entries(formData.guarantor).forEach(([key, value]) => {
            if (key === 'extraDocuments') {
                value.forEach(file => form.append(`guarantor[${key}]`, file));
            } else {
                form.append(`guarantor[${key}]`, value);
            }
        });

        try {
            const token = localStorage.getItem("crp_token");
            const response = await axios.post('http://localhost:5000/api/member', form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
            });
            console.log('Member data submitted successfully', response.data);
        } catch (error) {
            console.error('Error submitting member data', error.response || error);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 py-6">
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-[95%] max-w-6xl">
                <h2 className="text-2xl font-semibold mb-6 text-center text-gray-700">Member Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Member Details */}
                    <div className="mb-4">
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

                    <div className="mb-4">
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

                    <div className="mb-4">
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

                    <div className="mb-4">
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

                    <div className="mb-4">
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

                    <div className="mb-4">
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

                    <div className="mb-4">
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

                    <div className="mb-4">
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

                    <div className="mb-4">
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

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Guarantor Name *</label>
                        <input
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors['guarantor[name]'] ? 'border-red-500' : ''}`}
                            type="text"
                            name="guarantor[name]"
                            placeholder="Guarantor's Full Name"
                            value={formData.guarantor.name}
                            onChange={handleInputChange}
                            required
                        />
                        {errors['guarantor[name]'] && <p className="text-red-500 text-xs italic">{errors['guarantor[name]']}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Guarantor Mobile Number *</label>
                        <input
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors['guarantor[mobileNo]'] ? 'border-red-500' : ''}`}
                            type="text"
                            name="guarantor[mobileNo]"
                            placeholder="10-digit Mobile Number"
                            value={formData.guarantor.mobileNo}
                            onChange={handleInputChange}
                            required
                        />
                        {errors['guarantor[mobileNo]'] && <p className="text-red-500 text-xs italic">{errors['guarantor[mobileNo]']}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Relation *</label>
                        <select
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors['guarantor[relation]'] ? 'border-red-500' : ''}`}
                            name="guarantor[relation]"
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
                        {errors['guarantor[relation]'] && <p className="text-red-500 text-xs italic">{errors['guarantor[relation]']}</p>}
                    </div>

                    {/* Guarantor Extra Documents */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Extra Document 1</label>
                        <input
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors['guarantor[extraDoc1]'] ? 'border-red-500' : ''}`}
                            type="file"
                            name="guarantor[extraDoc1]"
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                        {errors['guarantor[extraDoc1]'] && <p className="text-red-500 text-xs italic">{errors['guarantor[extraDoc1]']}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Extra Document 2</label>
                        <input
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors['guarantor[extraDoc2]'] ? 'border-red-500' : ''}`}
                            type="file"
                            name="guarantor[extraDoc2]"
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                        {errors['guarantor[extraDoc2]'] && <p className="text-red-500 text-xs italic">{errors['guarantor[extraDoc2]']}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Extra Document 3</label>
                        <input
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors['guarantor[extraDoc3]'] ? 'border-red-500' : ''}`}
                            type="file"
                            name="guarantor[extraDoc3]"
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                        {errors['guarantor[extraDoc3]'] && <p className="text-red-500 text-xs italic">{errors['guarantor[extraDoc3]']}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Extra Document 4</label>
                        <input
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors['guarantor[extraDoc3]'] ? 'border-red-500' : ''}`}
                            type="file"
                            name="guarantor[extraDoc4]"
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                        {errors['guarantor[extraDoc4]'] && <p className="text-red-500 text-xs italic">{errors['guarantor[extraDoc4]']}</p>}
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