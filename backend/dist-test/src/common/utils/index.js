"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEmployeeCode = generateEmployeeCode;
exports.maskAadhaar = maskAadhaar;
exports.maskPAN = maskPAN;
exports.maskAccountNumber = maskAccountNumber;
exports.calculateAge = calculateAge;
exports.isValidPAN = isValidPAN;
exports.isValidAadhaar = isValidAadhaar;
exports.isValidIFSC = isValidIFSC;
exports.isValidGSTIN = isValidGSTIN;
exports.isValidMobile = isValidMobile;
exports.buildPaginationMeta = buildPaginationMeta;
function generateEmployeeCode(prefix, seq) {
    return `${prefix}${String(seq).padStart(6, '0')}`;
}
function maskAadhaar(aadhaar) {
    if (aadhaar.length !== 12)
        return '********';
    return `****${aadhaar.slice(-4)}`;
}
function maskPAN(pan) {
    if (pan.length !== 10)
        return '********';
    return `${pan.slice(0, 4)}****${pan.slice(-1)}`;
}
function maskAccountNumber(account) {
    if (account.length <= 4)
        return '****';
    return `****${account.slice(-4)}`;
}
function calculateAge(dob) {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate()))
        age--;
    return age;
}
function isValidPAN(pan) {
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
}
function isValidAadhaar(aadhaar) {
    return /^\d{12}$/.test(aadhaar);
}
function isValidIFSC(ifsc) {
    return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
}
function isValidGSTIN(gstin) {
    return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin);
}
function isValidMobile(mobile) {
    return /^[6-9]\d{9}$/.test(mobile);
}
function buildPaginationMeta(total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    return {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
}
//# sourceMappingURL=index.js.map