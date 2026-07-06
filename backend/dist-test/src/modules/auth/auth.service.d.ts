import { BaseService } from '../../common/base/index.js';
export declare class AuthService extends BaseService {
    login(input: {
        email: string;
        password: string;
    }, ipAddress?: string, userAgent?: string): Promise<{
        mfaRequired: boolean;
        sessionToken: string;
        message: string;
    } | {
        user: {
            id: string;
            email: string;
            fullName: any;
            tenantId: any;
            employeeId: any;
            roles: string[];
        };
        accessToken: string;
        refreshToken: string;
        mfaRequired: boolean;
        sessionToken?: undefined;
        message?: undefined;
    }>;
    refresh(refreshTokenValue: string): Promise<{
        user: {
            id: string;
            email: string;
            fullName: any;
            tenantId: any;
            roles: string[];
        };
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshTokenValue: string, accessToken: string): Promise<{
        message: string;
    }>;
    private getUserRoles;
    private generateTokens;
    private handleFailedLogin;
    private logLogin;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map