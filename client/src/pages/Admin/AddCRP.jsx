import React, { useState } from "react";
import axios from "axios";
import { Eye, EyeOff, Copy } from "lucide-react";

const AddCRP = () => {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    // username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleCopy = () => {
    const textToCopy = `Email: ${formData.email}\nPassword: ${formData.password}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const validateForm = () => {
    let formErrors = {};
    if (!formData.name) formErrors.name = "Name is required";
    // if (!formData.username) formErrors.username = "Username is required";
    if (!formData.email) formErrors.email = "Email is required";
    if (!formData.mobile) formErrors.mobile = "Phone is required";
    if (!formData.password) formErrors.password = "Password is required";
    return formErrors;
  };

  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     const formErrors = validateForm();
  //     setErrors(formErrors);

  //     if (Object.keys(formErrors).length === 0) {
  //       try {
  //         const token = localStorage.getItem("admin_token");
  //         if (!token) {
  //           alert("Authorization token is missing.");
  //           return;
  //         }

  //         await axios.post(
  //           "https://bachatapi.codifyinstitute.org/api/admin/create-crp",
  //           formData,
  //           {
  //             headers: {
  //               "Content-Type": "application/json",
  //               Authorization: `Bearer ${token}`,
  //             },
  //           }
  //         );

  //         alert("CRP Member added successfully!");
  //         setFormData({
  //           name: "",
  //           //   username: "",
  //           email: "",
  //           mobile: "",
  //           password: "",
  //         });
  //       } catch (error) {
  //         console.error("Error adding CRP Member:", error);
  //         alert("Failed to add CRP Member. Please try again.");
  //       }
  //     }
  //   };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      try {
        const token = localStorage.getItem("admin_token");
        if (!token) {
          alert("Authorization token is missing.");
          return;
        }

        await axios.post(
          "https://bachatapi.codifyinstitute.org/api/admin/create-crp",
          formData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        alert("CRP Member added successfully!");
        setFormData({
          name: "",
          email: "",
          mobile: "",
          password: "",
        });
        setErrors({}); // Clear any previous errors
      } catch (error) {
        console.error("Error adding CRP Member:", error);

        if (error.response) {
          // Extract error message from backend
          const { data } = error.response;
          if (data.message) {
            alert(`Error:  ${data.message}`); // Show backend error message
          }

          // Handle validation errors
          if (data.errors) {
            setErrors(data.errors); // Set errors to be displayed in UI
          }
        } else {
          alert("Failed to add CRP Member. Please check your connection.");
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r pt-4 from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white shadow-lg mt-4 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Add CRP Member
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-600"
            >
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
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-600"
            >
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
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="mobile"
              className="block text-sm font-medium text-gray-600"
            >
              Phone
            </label>
            <input
              type="text"
              name="mobile"
              id="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              className={`w-full mt-2 p-3 border ${
                errors.mobile ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            />
            {errors.mobile && (
              <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-600"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full mt-2 p-3 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-6 right-10 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              <Copy className="w-5 h-5" />
              <span>Copy Email & Password</span>
            </button>
            {copied && <p className="text-green-600 text-xs mt-1">Copied!</p>}
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
