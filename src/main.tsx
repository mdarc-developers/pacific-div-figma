import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@/app/App";
import { AuthProvider } from '@/app/contexts/AuthContext';
import { ConferenceProvider } from '@/app/contexts/ConferenceContext';
import "@/styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConferenceProvider>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </ConferenceProvider>
  </StrictMode>
);
