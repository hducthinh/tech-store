import { UserRole } from "../constants";

export interface JwtPayload {
  id: string;
  role: UserRole;
}

