export enum Role {
  USER,
  ADMIN,
}
export type User = {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  role: Role;
};
