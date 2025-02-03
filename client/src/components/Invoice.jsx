import React from "react";
import { useParams } from "react-router-dom";
import { DollarSign, Calendar, Download } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";  // Import the autoTable plugin

const SalarySlipPage = () => {
    const { teacherId } = useParams(); // Get the teacherId from the URL

    // Dummy salary data (This could be fetched from an API in real-world scenarios)
    const salaryData = {
        teacherName: "John Doe",
        month: "October 2023",
        baseSalary: 50000,
        deductions: 5000,
        allowances: 0,
        totalSalary: 45000,
        paidAmount: 40000,
        status: "Paid",
    };

    // Function to handle generating and downloading the salary slip as a PDF
    const handleDownload = () => {
        const doc = new jsPDF();

        // Set up fonts, title, etc.
        doc.setFont("helvetica", "normal");

        // Add Company Info (Header)
        doc.setFontSize(18);
        doc.text("ABC School", 105, 20, { align: "center" });
        doc.setFontSize(10);
        doc.text("123 School Street, City, Country", 105, 30, { align: "center" });
        doc.text("Email: info@abcschool.com | Phone: +123 456 7890", 105, 35, { align: "center" });
        
        doc.line(20, 40, 190, 40); // Add line for separation

        // Add Salary Slip Title
        doc.setFontSize(16);
        doc.text(`Salary Slip - ${teacherId}`, 105, 50, { align: "center" });

        // Add Teacher and Salary Information
        doc.setFontSize(12);
        doc.text(`Name: ${salaryData.teacherName}`, 20, 60);
        doc.text(`Employee ID: ${teacherId}`, 20, 70);
        doc.text(`Month: ${salaryData.month}`, 20, 80);
        doc.text(`Status: ${salaryData.status}`, 20, 90);
        
        doc.text("Salary Breakdown:", 105, 100, { align: "center" });

        // Add Salary Breakdown (Table)
        doc.autoTable({
            startY: 110,
            head: [["Description", "Amount (₹)"]],
            body: [
                ["Base Salary", salaryData.baseSalary],
                ["Allowances", salaryData.allowances],
                ["Deductions", `-${salaryData.deductions}`],
                ["Total Salary", salaryData.totalSalary],
            ],
            theme: "grid",
            styles: {
                fontSize: 10,
                cellPadding: 4,
                overflow: "linebreak",
                halign: "center",
            },
            headStyles: {
                fontSize: 12,
                fontStyle: "bold",
            },
        });

        // Add Payment Details
        doc.text("Payment Details:", 105, doc.lastAutoTable.finalY + 10, { align: "center" });
        doc.text(`Paid Amount: ₹${salaryData.paidAmount}`, 20, doc.lastAutoTable.finalY + 20);
        doc.text(`Payment Status: ${salaryData.status}`, 20, doc.lastAutoTable.finalY + 30);

        // Add Footer
        doc.setFontSize(8);
        doc.text("Thank you for your hard work and dedication!", 105, doc.lastAutoTable.finalY + 50, { align: "center" });
        doc.text("This is a system-generated salary slip and does not require a signature.", 105, doc.lastAutoTable.finalY + 55, { align: "center" });

        // Save the generated PDF
        doc.save(`Salary_Slip_${teacherId}_${salaryData.month}`.pdf);
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        Salary Slip - {teacherId}
                    </h1>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <Download className="w-5 h-5" />
                        Download Salary Slip
                    </button>
                </div>

                {/* Salary Slip Content */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    {/* Company and Employee Details */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800">ABC School</h2>
                        <p className="text-sm text-gray-600">123 School Street, City, Country</p>
                        <p className="text-sm text-gray-600">Email: info@abcschool.com | Phone: +123 456 7890</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Employee Details</h3>
                            <p className="text-sm text-gray-700">Name: {salaryData.teacherName}</p>
                            <p className="text-sm text-gray-700">Employee ID: {teacherId}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Salary Details</h3>
                            <p className="text-sm text-gray-700">Month: {salaryData.month}</p>
                            <p className="text-sm text-gray-700">Status: {salaryData.status}</p>
                        </div>
                    </div>

                    {/* Salary Breakdown */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Salary Breakdown</h3>
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3 text-left text-sm font-medium text-gray-600">Description</th>
                                    <th className="p-3 text-right text-sm font-medium text-gray-600">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="p-3 text-sm text-gray-700">Base Salary</td>
                                    <td className="p-3 text-sm text-gray-700 text-right">₹{salaryData.baseSalary}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="p-3 text-sm text-gray-700">Allowances</td>
                                    <td className="p-3 text-sm text-gray-700 text-right">₹{salaryData.allowances}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="p-3 text-sm text-gray-700">Deductions</td>
                                    <td className="p-3 text-sm text-gray-700 text-right">-₹{salaryData.deductions}</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="p-3 text-sm font-semibold text-gray-800">Total Salary</td>
                                    <td className="p-3 text-sm font-semibold text-gray-800 text-right">₹{salaryData.totalSalary}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Payment Details */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Details</h3>
                        <p className="text-sm text-gray-700">Paid Amount: ₹{salaryData.paidAmount}</p>
                        <p className="text-sm text-gray-700">Payment Status: {salaryData.status}</p>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center text-sm text-gray-600">
                        <p>Thank you for your hard work and dedication!</p>
                        <p>This is a system-generated salary slip and does not require a signature.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalarySlipPage;
