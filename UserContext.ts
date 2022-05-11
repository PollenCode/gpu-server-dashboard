import { User } from ".prisma/client";
import { createContext } from "react";

export const UserContext = createContext<User>(null as any);
