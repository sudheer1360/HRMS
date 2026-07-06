export declare function generateEmployeeCode(prefix: string, seq: number): string;
export declare function maskAadhaar(aadhaar: string): string;
export declare function maskPAN(pan: string): string;
export declare function maskAccountNumber(account: string): string;
export declare function calculateAge(dob: Date): number;
export declare function isValidPAN(pan: string): boolean;
export declare function isValidAadhaar(aadhaar: string): boolean;
export declare function isValidIFSC(ifsc: string): boolean;
export declare function isValidGSTIN(gstin: string): boolean;
export declare function isValidMobile(mobile: string): boolean;
export declare function buildPaginationMeta(total: number, page: number, limit: number): {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
};
//# sourceMappingURL=index.d.ts.map