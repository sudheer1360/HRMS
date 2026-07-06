export declare const config: {
    readonly port: number;
    readonly nodeEnv: string;
    readonly corsOrigin: string[];
    readonly logLevel: string;
    readonly db: {
        readonly host: string;
        readonly port: number;
        readonly user: string;
        readonly password: string;
        readonly database: string;
        readonly poolSize: number;
    };
    readonly jwt: {
        readonly privateKey: string;
        readonly publicKey: string;
        readonly accessExpiry: string;
        readonly refreshExpiry: string;
    };
    readonly bcrypt: {
        readonly rounds: number;
    };
    readonly rateLimit: {
        readonly windowMs: number;
        readonly max: number;
    };
    readonly redis: {
        readonly url: string;
    };
    readonly encryption: {
        readonly key: string;
    };
};
//# sourceMappingURL=index.d.ts.map