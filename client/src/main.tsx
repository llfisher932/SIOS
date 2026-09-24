import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Slide, ToastContainer } from "react-toastify";
import "@fontsource-variable/inter";
import "./index.css";
import App from "./App.tsx";
import theme from "./theme.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
      <ToastContainer position="top-right" autoClose={5000} newestOnTop pauseOnFocusLoss={false} transition={Slide} />
    </ThemeProvider>
  </StrictMode>,
);
