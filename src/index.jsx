import React from "react";
import ReactDOM from "react-dom/client";
import "./i18n/i18n";
import "./styles/index.scss";
import App from "./App";
import { AppProvider } from "./contexts/app.context";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <HelmetProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </HelmetProvider>
  </BrowserRouter>
);
