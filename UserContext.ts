import { createContext } from "react";

export const UserContext = createContext<{ userName: string; email: string; id: number }>(null as any);
