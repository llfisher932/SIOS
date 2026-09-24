import { createTheme } from "@mui/material/styles";

// Team proposal palette (not client-confirmed): warm neutral base,
// deep neutral for primary actions, brand red for header/accents only.
// Brand red is deliberately NOT the primary color so it doesn't collide with errors.
export const brand = {
  red: "#c8102e",
  black: "#111111",
};

const theme = createTheme({
  palette: {
    primary: {
      main: "#2b2724",
      light: "#45403b",
      contrastText: "#ffffff",
    },
    error: {
      main: "#b3261e",
    },
    warning: {
      main: "#b26a00",
    },
    success: {
      main: "#2e7d32",
    },
    background: {
      default: "#f7f5f2",
      paper: "#ffffff",
    },
    text: {
      primary: "#1f1c1a",
      secondary: "#6b645d",
    },
    divider: "#d9d4cd",
  },
  shape: {
    borderRadius: 4, // controls; cards/panels use 2 (8px)
  },
  typography: {
    fontFamily: '"Inter Variable", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,
    h5: {
      fontWeight: 650,
      letterSpacing: "-0.01em",
    },
    body2: {
      fontSize: "0.8125rem",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiLink: {
      defaultProps: {
        color: "text.secondary",
      },
    },
  },
});

export default theme;
