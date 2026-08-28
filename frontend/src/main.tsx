import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppProvider } from "./context/AppContext.tsx"
import 'leaflet/dist/leaflet.css'
import { SocketProvider } from './context/SocketContext.tsx';


export const authService = import.meta.env.VITE_AUTH_SERVICE;
export const restaurantService = import.meta.env.VITE_RESTAURANT_SERVICE;
export const utilsService = import.meta.env.VITE_UTILS_SERVICE;
export const realtimeService = import.meta.env.VITE_REALTIME_SERVICE;
export const riderService = import.meta.env.VITE_RIDER_SERVICE;
export const adminService = import.meta.env.VITE_ADMIN_SERVICE;



createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="733469696296-d1hoh3vq1nas4de5rcj9956vpdk1liju.apps.googleusercontent.com">
         <AppProvider>
          <SocketProvider>
            <App />
          </SocketProvider>
         </AppProvider>
          
    </GoogleOAuthProvider>
  </StrictMode>
);
