import 'next-auth';

declare module 'next-auth' {
  type User = {
    organizationId?: string;
    organizationSlug?: string;
    permissions?: string[];
  };

  type Session = {
    user: {
      id: string;
      organizationId: string;
      organizationSlug: string;
      permissions: string[];
    } & DefaultSession['user'];
  };
}

declare module 'next-auth/jwt' {
  type JWT = {
    id: string;
    organizationId: string;
    organizationSlug: string;
    permissions: string[];
  };
}
