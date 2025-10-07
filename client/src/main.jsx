
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./index.css";
import App from "./App.jsx";
import { UserProvider } from "./contexts/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
    <BrowserRouter>
      <UserProvider>
        <App />
        <ToastContainer position="top-right" autoClose={2500} theme="colored" />
      </UserProvider>
    </BrowserRouter>
);
