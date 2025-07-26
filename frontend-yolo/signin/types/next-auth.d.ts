import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      uuid: string;
      nickname: string;
      avatar_url: string;
      created_at: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uuid?: string;
    nickname?: string;
    avatar_url?: string;
    created_at?: string;
  }
}