import { useState, useEffect } from 'react';
import { AppContent } from '@/app/AppContent';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import { CompanyProvider } from '@/app/context/CompanyContext';
import { GoogleLogin, GoogleUserData } from '@/app/components/GoogleLogin';
import { LoadingScreen } from '@/app/components/LoadingScreen';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<GoogleUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si ya hay sesión activa
  useEffect(() => {
    const token = localStorage.getItem('google_access_token');
    const storedUserData = localStorage.getItem('user_data');

    if (token && storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error al recuperar datos de usuario:', error);
        localStorage.removeItem('google_access_token');
        localStorage.removeItem('user_data');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (userData: GoogleUserData) => {
    setUserData(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('user_data');
    setUserData(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <ThemeProvider>
        <LoadingScreen 
          message="Cargando SafeTrack Chile..." 
          submessage="Inicializando sistema de prevención de riesgos"
        />
      </ThemeProvider>
    );
  }

  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <GoogleLogin onLoginSuccess={handleLoginSuccess} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <CompanyProvider>
        <AppContent userData={userData} onLogout={handleLogout} />
      </CompanyProvider>
    </ThemeProvider>
  );
}