import 'next-auth';

declare module 'next-auth' {
  type User = {
    organizationId?: string;
    organizationSlug?: string;
    permissions?: string[];
    mustChangePassword?: boolean;
    isSuperAdmin?: boolean;
  };

  type Session = {
    user: {
      id: string;
      organizationId: string;
      organizationSlug: string;
      permissions: string[];
      mustChangePassword: boolean;
      isSuperAdmin: boolean;
    } & DefaultSession['user'];
    mustChangePassword?: boolean;
  };
}

declare module 'next-auth/jwt' {
  type JWT = {
    id: string;
    organizationId: string;
    organizationSlug: string;
    permissions: string[];
    mustChangePassword?: boolean;
    isSuperAdmin?: boolean;
  };
}
