import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from "../assets/Images/logo.png";
import { generateReceiptNo } from '../utils/ReceiptNo';

const SavingInvoice = ({
    data = {
        date: "N/A",
        membername: "N/A",
        amount: "N/A",
        amountInWords: "N/A",
        savingAmount: "N/A",
        groupName: "N/A",
        termMonth: "N/A",
        loanId:'N/A'
    },
}) => {
    const slipRef = useRef(null);
    const [receiptNo, setReceiptNo] = useState('');

    useEffect(() => {
        setReceiptNo(generateReceiptNo());
    }, []);

    const handleDownloadPdf = () => {
        const input = slipRef.current;

        html2canvas(input, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save('deposit_slip.pdf');
        });
    };

    return (
        <div
            className="min-h-screen flex flex-col justify-center items-center"
            style={{ backgroundColor: 'rgb(243, 244, 246)' }} // Light gray
        >
            <div
                ref={slipRef}
                className="p-8 shadow-lg border flex flex-col items-center"
                style={{
                    backgroundColor: 'rgb(255, 255, 255)', // White
                    borderColor: 'rgb(209, 213, 219)', // Gray
                    width: '500px',
                    height: '670px',
                }}
            >
                {/* Header */}
                <div className="flex justify-between items-center w-full mb-6">
                    <img src={logo} alt="Logo" className="h-20 w-auto" />
                    <div className="text-right">
                        <h2
                            className="text-lg font-bold"
                            style={{ color: 'rgb(234, 179, 8)' }} // Yellow
                        >
                            SAVING IN SLIP
                        </h2>
                        <h1
                            className="text-2xl font-bold"
                            style={{ color: 'rgb(31, 41, 55)' }} // Dark gray
                        >
                            SHIV KRUPA FOUNDATION, KOLHAPUR
                        </h1>
                    </div>
                </div>

                {/* Fields */}
                <table
                    className="border w-full border-collapse"
                    style={{
                        width: '100%',
                        borderColor: 'rgb(209, 213, 219)', // Gray border
                    }}
                >
                    <tbody>
                        {[
                            { label: 'RECEIPT NO:', value: receiptNo },
                            { label: 'DATE:', value: data.date },
                            { label: 'LOAN ID:', value: data.loanId },
                            { label: 'GROUP NAME:', value: data.groupName },
                            { label: 'NAME:', value: data.membername },
                            { label: 'SAVING AMOUNT PER MONTH:', value: data.amount },
                            { label: 'TERM MONTH:', value: data.termMonth },
                            { label: 'TOTAL SAVING AMOUNT:', value: data.savingAmount },
                            { label: 'IN WORDS:', value: data.amountInWords },
                            
                        ].map((row, index) => (
                            <tr className="border" key={index}>
                                <td
                                    className="border px-4 py-2"
                                    style={{
                                        borderColor: 'rgb(209, 213, 219)', // Gray
                                        color: 'rgb(31, 41, 55)', // Dark gray text
                                    }}
                                >
                                    <strong>{row.label}</strong>
                                </td>
                                <td
                                    className="border px-4 py-2"
                                    style={{
                                        borderColor: 'rgb(209, 213, 219)', // Gray
                                        color: 'rgb(55, 65, 81)', // Slightly lighter dark gray
                                    }}
                                >
                                    {row.value}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Footer */}
                <p
                    className="text-sm mt-4 border-t pt-2 text-center"
                    style={{
                        color: 'rgb(107, 114, 128)', // Gray text
                        borderColor: 'rgb(209, 213, 219)', // Gray border
                        width: '100%',
                    }}
                >
                    This is a system-generated deposit slip, it doesn't require a signature or stamp.
                </p>
            </div>

            {/* Download PDF Button */}
            <div
                className="mt-2 text-center"
                style={{ width: '500px', display: 'flex', justifyContent: 'center' }}
            >
                <button
                    onClick={handleDownloadPdf}
                    className="px-6 py-2 rounded"
                    style={{
                        backgroundColor: 'rgb(59, 130, 246)', // Blue
                        color: 'rgb(255, 255, 255)', // White
                        width: '200px',
                        height: '50px',
                    }}
                >
                    Download PDF
                </button>
            </div>
        </div>
    );
};

export default SavingInvoice;
