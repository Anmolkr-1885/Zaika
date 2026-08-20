import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppProvider } from "./context/AppContext.tsx"


export const authService= "http://localhost:5000"
export const restaurantService= "http://localhost:5001"


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="733469696296-d1hoh3vq1nas4de5rcj9956vpdk1liju.apps.googleusercontent.com">
         <AppProvider>
          <App />
         </AppProvider>
          
    </GoogleOAuthProvider>
  </StrictMode>
);
