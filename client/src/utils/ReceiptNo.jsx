// util/utils.js

export const generateReceiptNo = () => {
    const timestamp = Date.now().toString();
    const randomNum = Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit random number
    return `REC-${timestamp}-${randomNum}`;
};
