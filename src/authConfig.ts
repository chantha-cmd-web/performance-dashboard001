import bcrypt from 'bcryptjs';

interface StoredUser {
  userId: string;
  role: 'super_admin' | 'admin';
  name: string;
  passwordHash: string;
}

const USERS: StoredUser[] = [
  {
    userId: 'superadmin',
    role: 'super_admin',
    name: 'Super Administrator',
    passwordHash: '$2b$10$DXCkvBCfUpo0FhhE4fgzDuIqzRL8fq8nWu8CLyqmlAPaaXrybR48G',
  },
  {
    userId: 'admin',
    role: 'admin',
    name: 'Admin User',
    passwordHash: '$2b$10$DXCkvBCfUpo0FhhE4fgzDuqp6AKpQH02C92wcG0Lr9QKOitv4HSCC',
  },
];

export async function authenticateUser(userId: string, password: string) {
  const user = USERS.find((u) => u.userId === userId);
  if (!user) return null;
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return null;
  return {
    userId: user.userId,
    role: user.role,
    name: user.name,
    avatarInitials: user.name.split(/\s+/).map((w) => w[0]).join('').toUpperCase().slice(0, 2),
  };
}
