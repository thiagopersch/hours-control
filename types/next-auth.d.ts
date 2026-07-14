import 'next-auth';

type SessionPermission = { resource: string; action: string; scope: string };

declare module 'next-auth' {
  type User = {
    organizationId?: string;
    organizationSlug?: string;
    permissions?: SessionPermission[];
    mustChangePassword?: boolean;
    isSuperAdmin?: boolean;
    analystId?: string | null;
    teamId?: string | null;
    departmentId?: string | null;
    clientId?: string | null;
  };

  type Session = {
    user: {
      id: string;
      organizationId: string;
      organizationSlug: string;
      permissions: SessionPermission[];
      mustChangePassword: boolean;
      isSuperAdmin: boolean;
      analystId: string | null;
      teamId: string | null;
      departmentId: string | null;
      clientId: string | null;
    } & DefaultSession['user'];
    mustChangePassword?: boolean;
  };
}

declare module 'next-auth/jwt' {
  type JWT = {
    id: string;
    organizationId: string;
    organizationSlug: string;
    permissions: SessionPermission[];
    mustChangePassword?: boolean;
    isSuperAdmin?: boolean;
    analystId?: string | null;
    teamId?: string | null;
    departmentId?: string | null;
    clientId?: string | null;
  };
}
