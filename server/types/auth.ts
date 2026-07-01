import { Request } from "express";
import { UserRole } from "../constants";

export interface AuthenticatedRequest extends Request {
  user: {
    _id: string;
    role: UserRole;
  };
}

