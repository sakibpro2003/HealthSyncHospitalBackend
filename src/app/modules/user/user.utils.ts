import { UserRole } from "./user.interface";

export const searchableFields = ["name", "email", "phone"];

const recognisedRoles: UserRole[] = [
  UserRole.ADMIN,
  UserRole.RECEPTIONIST,
  UserRole.DOCTOR,
  UserRole.USER,
];

export const normaliseUserRole = (role: unknown): UserRole => {
  if (typeof role === "string") {
    const normalised = role.trim().toLowerCase();

    if (normalised === "patient") {
      return UserRole.USER;
    }

    if (recognisedRoles.includes(normalised as UserRole)) {
      return normalised as UserRole;
    }
  } else if (recognisedRoles.includes(role as UserRole)) {
    return role as UserRole;
  }

  return UserRole.USER;
};
