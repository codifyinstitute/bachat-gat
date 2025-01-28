import React, { useState } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root'); // Ensures screen readers handle the modal correctly

const AllMembers = () => {
  const [members] = useState([
    {
      _id: "67976dadd0b95e0d78a2e947",
      name: "Shubham Doe Updated",
      address: "456 Updated Street",
      dateOfBirth: "1990-01-01T00:00:00.000+00:00",
      referredBy: {
        crpName: "John Doe",
        crpMobile: "1234567890",
        crpId: "67973b222d4bd6c8d0898869",
      },
      aadharNo: "123456789012",
      panNo: "ABCDE1234F",
      mobileNumber: "9876543210",
      guarantor: {
        name: "Jane Doe",
        mobileNo: "1234567890",
        relation: "Mother",
        photo: "uploads/guarantor-photo.png",
      },
      chequePhoto: "uploads/cheque-photo.png",
      extraDocuments: ["uploads/document1.png", "uploads/document2.png"],
      status: "active",
      createdAt: "2025-01-27T11:27:41.305+00:00",
      updatedAt: "2025-01-27T11:27:41.305+00:00",
    },
  ]);

  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMember(null);
    setIsModalOpen(false);
  };

  return (
    <div className=" flex justify-center items-center flex-col">

      {/* Main Content */}
      <div className="flex-1">
        <div className="container mx-auto p-4">
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
                  <div className="flex-1 pl-1">
                    <div className="font-medium">
                      <p>{member.name}</p>
                      <p className="text-gray-600 text-xs">ID: {member._id}</p>
                    </div>
                  </div>
                  <div className="text-gray-600 text-sm">
                    <p>Ref: {member.referredBy?.crpName || "N/A"}</p>
                    <p>ID: {member.referredBy?.crpId || "N/A"}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Member Details"
          className="bg-white rounded-lg w-[100%] shadow-lg p-6 max-w-[50%] h-[90vh] mx-auto mt-10 outline-none overflow-y-auto mb-10"
          overlayClassName="fixed inset-0 w-full z-3 bg-gray-100 bg-opacity-50 flex justify-center items-start"
        >
          {selectedMember && (
            <div>
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
    </div>
  );
};

export default AllMembers;
