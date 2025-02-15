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

    const formatDate = (date) => {
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, '0'); // Get day and pad with leading zero if necessary
        const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Get month and pad with leading zero if necessary
        const year = d.getFullYear(); // Get full year

        return `${day}/${month}/${year}`;
    };


    return (
        <div className="my-3">
            <h4 className="font-semibold mb-2">Late Payments:</h4>
            {data.length > 0 ? (
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-300">
                            <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((payment, index) => (
                            <tr key={index} className="border border-gray-400">
                                <td className="border border-gray-300 px-4 py-2">
                                    {formatDate(payment.paymentDate)}
                                </td>

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
