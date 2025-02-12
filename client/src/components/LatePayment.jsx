import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LatePayment = ({ memberid }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/collection/latepayment/${memberid}`
                );
                if (response.data) {
                    setData(response.data.latePaymentDetails);
                }
            } catch (error) {
                console.error("Error fetching late payments:", error);
            }
        };

        if (memberid) {
            fetchData();
        }
    }, [memberid]);

    return (
        <div className="mt-3 p-2 border rounded">
            <h4 className="font-semibold mb-2">Late Payments:</h4>
            {data.length > 0 ? (
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((payment, index) => (
                            <tr key={index} className="border border-gray-300">
                                <td className="border border-gray-300 px-4 py-2">{payment.paymentDate}</td>
                                <td className="border border-gray-300 px-4 py-2">₹{payment.latePaymentCharge}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-gray-500">No late payments recorded</p>
            )}
        </div>
    );
};

export default LatePayment;
