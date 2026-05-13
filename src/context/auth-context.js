import { useContext } from 'react';
import { createContext } from 'react';

export const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth должен использоваться внутри AuthProvider');
    }
    return context;
};
