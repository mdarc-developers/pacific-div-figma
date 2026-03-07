import React from "react";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { ConferenceProvider } from "@/app/contexts/ConferenceContext";
import { AuthProvider } from "@/app/contexts/AuthContext";
import { BookmarkProvider } from "@/app/contexts/BookmarkContext";
import { ExhibitorBookmarkProvider } from "@/app/contexts/ExhibitorBookmarkContext";
import { NotesProvider } from "@/app/contexts/NotesContext";
import { SearchProvider } from "@/app/contexts/SearchContext";
import { ThemeProvider } from "@/app/contexts/ThemeContext";
import { BrowserRouter } from "react-router-dom";
import App from "@/app/App";
import "@/styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <ConferenceProvider>
        <BookmarkProvider>
          <ExhibitorBookmarkProvider>
            <NotesProvider>
              <AuthProvider>
                <SearchProvider>
                  <BrowserRouter>
                    <App />
                  </BrowserRouter>
                </SearchProvider>
              </AuthProvider>
            </NotesProvider>
          </ExhibitorBookmarkProvider>
        </BookmarkProvider>
      </ConferenceProvider>
    </ThemeProvider>
  </StrictMode>,
);
