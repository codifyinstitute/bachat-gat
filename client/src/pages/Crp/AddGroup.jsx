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
  const [existingGroupNames, setExistingGroupNames] = useState([]);
  const [checkingName, setCheckingName] = useState(false); // For checking the group name
  const [isGroupNameValid, setIsGroupNameValid] = useState(true); // To track if group name is valid

  // Fetch active members and group names on load
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

        const membersArray = Array.isArray(response.data)
          ? response.data
          : response.data.members || [];
        const activeMembers = membersArray.filter(
          (member) => member.status === "active"
        );

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

    const fetchGroupNames = async () => {
      try {
        const token = localStorage.getItem("crp_token");
        if (!token) {
          alert("Authorization token is missing.");
          return;
        }

        const response = await axios.get("http://localhost:5000/api/groups", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const groupNames = response.data.map((group) => group.name);
        setExistingGroupNames(groupNames);
      } catch (error) {
        console.error("Error fetching group names:", error);
      }
    };

    fetchMembers();
    fetchGroupNames();
  }, []);

  // console.log("first",existingGroupNames)

  // Function to handle group name change and check if it's available
  const handleNameChange = async (e) => {
    const groupName = e.target.value;
    setName(groupName);
    setCheckingName(true);

    if (existingGroupNames.includes(groupName)) {
      setIsGroupNameValid(false); // If group name exists, set invalid
    } else {
      setIsGroupNameValid(true); // If group name is available, set valid
    }

    setCheckingName(false); // Done checking
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (selectedMembers.length < 3 || selectedMembers.length > 10) {
      setMessage("You need to select minimum 3 and maximum 10 members.");
      setLoading(false);
      return;
    }

    if (!isGroupNameValid) {
      setMessage("Group name already exists.");
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
        status: "inactive",
      })),
      whatsappGroupLink: whtslink,
    };

    try {
      const response = await axios.post("http://localhost:5000/api/groups", groupData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setMessage("Group created successfully!");
      alert("Group created successfully!");
    } catch (error) {
      setMessage("Error creating group. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white shadow-md rounded h-[fit-content] overflow-y-auto mt-16 xl:min-h-[600px] min-h-[500px]">
      <h1 className="text-xl font-bold mb-4">Create Group</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block text-sm font-medium">Group Name</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={name}
            onChange={handleNameChange}
            required
          />
          {checkingName && <p>Checking group name...</p>} {/* Show loader when checking */}
          {!isGroupNameValid && (
            <p className="text-red-500 mt-2">Group name already exists.</p>
          )}
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
          {(selectedMembers.length < 3 || selectedMembers.length > 10) && (
            <p className="text-red-500 mt-2">
              You need to select minimum 3 and maximum 10 members.
            </p>
          )}
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded w-full"
          disabled={loading || selectedMembers.length < 3 || selectedMembers.length > 10 || !isGroupNameValid}
        >
          {loading ? "Creating..." : "Create Group"}
        </button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
};

export default CreateGroupForm;
