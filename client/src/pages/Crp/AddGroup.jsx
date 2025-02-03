import { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";

const CreateGroupForm = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [crpname, setCrpname] = useState("");
  const [crpmobile, setCrpmobile] = useState("");
  const [whtslink, setWhstlink] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [allMembers, setAllMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const token = localStorage.getItem("crp_token");
        if (!token) {
          alert("Authorization token is missing.");
          return;
        }

        const response = await axios.get("http://localhost:5000/api/crp/membycrp", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("API Response:", response.data); // Debugging log

        const membersArray = Array.isArray(response.data) ? response.data : response.data.members || [];
        const activeMembers = membersArray.filter((member) => member.status === "active");

        const memberOptions = activeMembers.map((member) => ({
          value: member._id,
          label: `${member.name} - ${member.mobileNumber}`,
        }));

        setAllMembers(memberOptions);
      } catch (error) {
        console.error("Error fetching members:", error);
        alert("Failed to fetch members. Please try again.");
      }
    };

    fetchMembers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit button clicked!");
    setLoading(true);
    setMessage("");
  
    console.log("Selected Members:", selectedMembers.length);
    if (selectedMembers.length !== 1) { // Correcting the validation to exactly 10 members
      setMessage("You must select exactly 10 members to create a group.");
      setLoading(false);
      return;
    }
  
    const token = localStorage.getItem("crp_token");
    if (!token) {
      alert("Authorization token is missing.");
      setLoading(false);
      return;
    }
  
    const groupData = {
      name,
      address,
      referredBy: {
        crpName: crpname,
        crpMobile: crpmobile,
      },
      members: selectedMembers.map((m) => ({
        member: m.value,
        role: "member",
        status: "inactive", // Added this line to set status as 'inactive'
      })),
      whatsappGroupLink: whtslink,
    };
  
    console.log("Group Data:", groupData); // Debugging log
  
    try {
      const response = await axios.post("http://localhost:5000/api/groups", groupData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      console.log("API Response:", response.data);
      setMessage("Group created successfully!");
    } catch (error) {
      console.error("Error:", error);
      setMessage(error.response?.data?.message || "Error creating group. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white shadow-md rounded h-[90vh] overflow-y-auto mt-16">
      <h1 className="text-xl font-bold mb-4">Create Group</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block text-sm font-medium">Group Name</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium">Address</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium">CRP Name</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={crpname}
            onChange={(e) => setCrpname(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium">WhatsApp Link</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={whtslink}
            onChange={(e) => setWhstlink(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium">Members</label>
          <Select
            isMulti
            options={allMembers}
            value={selectedMembers}
            onChange={(selectedOptions) => setSelectedMembers(selectedOptions || [])}
            maxMenuHeight={250}
            isSearchable
            closeMenuOnSelect={false}
            placeholder="Select Members (Exactly 10)"
            isDisabled={loading}
            noOptionsMessage={() => "No members available"}
            isClearable
          />
          {selectedMembers.length !== 1 && selectedMembers.length > 0 && (
            <p className="text-red-500 mt-2">You need to select exactly 10 members.</p>
          )}
        </div>
        <button
          type="submit"
          style={{ pointerEvents: "auto", zIndex: 10 }}
          className="bg-blue-500 text-white p-2 rounded w-full"
          disabled={loading || selectedMembers.length !== 1}
        >
          {loading ? "Creating..." : "Create Group"}
        </button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
};

export default CreateGroupForm;
