import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

const AllMembers = () => {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/member/'); // Backend URL
        const data = await response.json();
        setMembers(data);
      } catch (error) {
        console.error('Error fetching members:', error);
      }
    };

    fetchData();
  }, []);

  const openModal = (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMember(null);
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="container flex mx-auto w-full items-center justify-center">
        <ul className="flex flex-col bg-gray-300 p-4">
          {members.map((member) => (
            <li key={member._id} className="border-gray-400 flex flex-row mb-2">
              <div
                onClick={() => openModal(member)}
                className="select-none cursor-pointer bg-gray-200 rounded-md flex flex-1 items-center p-4 transition duration-500 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex flex-col rounded-md w-10 h-10 bg-gray-300 justify-center items-center mr-4">
                  👤
                </div>
                <div className="flex-1 pl-1 mr-16">
                  <div className="font-medium">
                    <p>{member.name}</p>
                    <p className="text-gray-600 text-xs">id: {member._id}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onRequestClose={closeModal} contentLabel="Member Details">
        {selectedMember && (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Member Details</h2>
            <p><strong>ID:</strong> {selectedMember._id}</p>
            {selectedMember.name && <p><strong>Name:</strong> {selectedMember.name}</p>}
            {selectedMember.address && <p><strong>Address:</strong> {selectedMember.address}</p>}
            {selectedMember.dateOfBirth && <p><strong>Date of Birth:</strong> {new Date(selectedMember.dateOfBirth).toLocaleDateString()}</p>}
            {selectedMember.referredBy && (
              <div>
                <h3 className="font-semibold mt-2">Referred By</h3>
                {selectedMember.referredBy.crpName && <p><strong>Name:</strong> {selectedMember.referredBy.crpName}</p>}
                {selectedMember.referredBy.crpMobile && <p><strong>Mobile:</strong> {selectedMember.referredBy.crpMobile}</p>}
                {selectedMember.referredBy.crpId && <p><strong>ID:</strong> {selectedMember.referredBy.crpId}</p>}
              </div>
            )}
            {selectedMember.aadharNo && <p><strong>Aadhar No:</strong> {selectedMember.aadharNo}</p>}
            {selectedMember.panNo && <p><strong>PAN No:</strong> {selectedMember.panNo}</p>}
            {selectedMember.mobileNumber && <p><strong>Mobile Number:</strong> {selectedMember.mobileNumber}</p>}
            {selectedMember.guarantor && (
              <div>
                <h3 className="font-semibold mt-2">Guarantor</h3>
                {selectedMember.guarantor.name && <p><strong>Name:</strong> {selectedMember.guarantor.name}</p>}
                {selectedMember.guarantor.mobileNo && <p><strong>Mobile No:</strong> {selectedMember.guarantor.mobileNo}</p>}
                {selectedMember.guarantor.relation && <p><strong>Relation:</strong> {selectedMember.guarantor.relation}</p>}
                {selectedMember.guarantor.photo && (
                  <div>
                    <strong>Photo:</strong>
                    <img src={selectedMember.guarantor.photo} alt="Guarantor" className="mt-2 max-w-xs" />
                  </div>
                )}
              </div>
            )}
            {selectedMember.chequePhoto && (
              <div>
                <strong>Cheque Photo:</strong>
                <img src={selectedMember.chequePhoto} alt="Cheque" className="mt-2 max-w-xs" />
              </div>
            )}
            {selectedMember.extraDocuments && selectedMember.extraDocuments.length > 0 && (
              <div>
                <h3 className="font-semibold mt-2">Extra Documents</h3>
                {selectedMember.extraDocuments.map((doc, index) => (
                  <div key={index}>
                    <img src={doc} alt={`Document ${index + 1}`} className="mt-2 max-w-xs" />
                  </div>
                ))}
              </div>
            )}
            {selectedMember.status && <p><strong>Status:</strong> {selectedMember.status}</p>}
            {selectedMember.createdAt && <p><strong>Created At:</strong> {new Date(selectedMember.createdAt).toLocaleDateString()}</p>}
            {selectedMember.updatedAt && <p><strong>Updated At:</strong> {new Date(selectedMember.updatedAt).toLocaleDateString()}</p>}
            <button onClick={closeModal} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Close</button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AllMembers;