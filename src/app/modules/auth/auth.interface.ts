export interface IAuth {
  email: string;
  password: string;
  clientInfo: {
    device: "pc" | "mobile";
    browser: string;
    ipAddress: string;
    pcName?: string;
    os?: string;
    userAgent?: string;
  };
}
