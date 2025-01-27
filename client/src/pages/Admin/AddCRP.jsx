import React, { useState } from "react";
import axios from "axios";

const AddCRP = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
    });

    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const validateForm = () => {
        let formErrors = {};
        if (!formData.name) formErrors.name = "Name is required";
        if (!formData.email) formErrors.email = "Email is required";
        if (!formData.phone) formErrors.phone = "Phone is required";
        if (!formData.password) formErrors.password = "Password is required";
        return formErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formErrors = validateForm();
        setErrors(formErrors);

        if (Object.keys(formErrors).length === 0) {
            try {
                const response = await axios.post("https://your-api-endpoint.com/api/addCRP", formData);
                alert("CRP Member added successfully!");
                console.log(response.data);
                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    password: "",
                });
            } catch (error) {
                console.error("Error adding CRP Member:", error);
                alert("Failed to add CRP Member. Please try again.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-center px-4">
            <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Add CRP Member
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-600">
                            Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`w-full mt-2 p-3 border ${
                                errors.name ? "border-red-500" : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-600">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full mt-2 p-3 border ${
                                errors.email ? "border-red-500" : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-600">
                            Phone
                        </label>
                        <input
                            type="text"
                            name="phone"
                            id="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={`w-full mt-2 p-3 border ${
                                errors.phone ? "border-red-500" : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-600">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={`w-full mt-2 p-3 border ${
                                errors.password ? "border-red-500" : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                        )}
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none transition-all"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCRP;
