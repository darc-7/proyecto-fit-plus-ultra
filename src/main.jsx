import React from "react";
import ReactDOM from "react-dom/client";
import Root from "./routes/Root";
import { AuthProvider } from "./context/AuthContext";
import { TimerProvider } from "./context/TimerContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <TimerProvider>
        <Root />
      </TimerProvider>
    </AuthProvider>
  </React.StrictMode>
);