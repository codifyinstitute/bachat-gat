import { useEffect, useState } from "react";
import axios from "axios";

const BankList = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    branch: "",
    ifsc: "",
    interestRate: "",
    additionalDetails: "",
  });

  // Fetch banks on load
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/banks");
        setBanks(response.data);
      } catch (err) {
        setError("Failed to fetch bank data.");
      } finally {
        setLoading(false);
      }
    };
    fetchBanks();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission (Add Bank)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.branch || !formData.ifsc || !formData.interestRate) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/banks", formData);
      setBanks([...banks, response.data]); // Update list with new bank
      setFormData({ name: "", branch: "", ifsc: "", interestRate: "", additionalDetails: "" });
      setError("");
      window.location.reload();
    } catch (err) {
      setError("Failed to add bank. Please try again.");
    }
  };

  // Handle Delete Bank
  const handleDelete = async (id) => {
    // Show confirmation dialog before proceeding
    const confirmed = window.confirm("Are you sure you want to delete this bank?");
    
    if (!confirmed) {
      return; // Exit if the user clicks "Cancel"
    }
  
    try {
      await axios.delete(`http://localhost:5000/api/banks/${id}`);
      setBanks(banks.filter((bank) => bank._id !== id)); // Remove from UI
    } catch (err) {
      setError("Failed to delete bank.");
    }
  };
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-center mb-4">Bank List</h2>

      {/* Display Error */}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* Bank Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Branch</th>
              <th className="border border-gray-300 px-4 py-2">IFSC</th>
              <th className="border border-gray-300 px-4 py-2">Interest Rate</th>
              <th className="border border-gray-300 px-4 py-2">Details</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-4">Loading...</td>
              </tr>
            ) : (
              banks.map((bank) => (
                <tr key={bank._id} className="text-center">
                  <td className="border border-gray-300 px-4 py-2">{bank.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{bank.branch}</td>
                  <td className="border border-gray-300 px-4 py-2">{bank.ifsc}</td>
                  <td className="border border-gray-300 px-4 py-2">{bank.interestRate}%</td>
                  <td className="border border-gray-300 px-4 py-2">{bank.additionalDetails || "N/A"}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      onClick={() => handleDelete(bank._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Bank Form */}
      <h3 className="text-xl font-bold text-center mt-6">Add New Bank</h3>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto mt-4 p-4 border rounded-lg shadow-md">
        <div className="mb-3">
          <label className="block font-semibold">Bank Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div className="mb-3">
          <label className="block font-semibold">Branch:</label>
          <input
            type="text"
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div className="mb-3">
          <label className="block font-semibold">IFSC Code:</label>
          <input
            type="text"
            name="ifsc"
            value={formData.ifsc}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div className="mb-3">
          <label className="block font-semibold">Interest Rate (%):</label>
          <input
            type="number"
            name="interestRate"
            value={formData.interestRate}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div className="mb-3">
          <label className="block font-semibold">Additional Details (Optional):</label>
          <input
            type="text"
            name="additionalDetails"
            value={formData.additionalDetails}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          Add Bank
        </button>
      </form>
    </div>
  );
};

export default BankList;
