import { React } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App.tsx";
import { AuthProvider } from '@/app/contexts/AuthContext';
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  //<React.strictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  //</React.strictMode>
);
