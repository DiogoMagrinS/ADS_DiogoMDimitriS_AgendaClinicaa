// src/contexts/AuthContext.ts
import { createContext } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { 
    id: number; 
    email: string; 
    tipo: 'PACIENTE' | 'PROFISSIONAL' | 'RECEPCIONISTA'; 
  } | null;
  logout: () => void;
}

export const AuthContext = createContext({} as AuthContextType);
