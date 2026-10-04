import { AppBar, Box, Button, Divider, Toolbar, Typography } from "@mui/material";
import { Outlet, useNavigate } from "react-router";
import BrandMark from "./BrandMark";
import { brand } from "../theme";
import { useAuth } from "../auth/AuthContext";

// Shared page frame: brand header on every page, plus account info once signed in.
const Layout = () => {
  const { account, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="App">
      <AppBar position="static" elevation={0} sx={{ bgcolor: brand.black, borderBottom: `3px solid ${brand.red}` }}>
        <Toolbar sx={{ gap: 1.5, minHeight: { xs: 56 } }}>
          <BrandMark />
          <Typography component="span" sx={{ fontWeight: 700, fontSize: "1rem", letterSpacing: "0.04em" }}>
            SIOS
          </Typography>
          <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,0.2)", my: 2 }} />
          <Typography
            component="span"
            sx={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)", display: { xs: "none", sm: "inline" } }}>
            Team Nitro MMA SEALTeam
          </Typography>

          {account && (
            <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                component="span"
                sx={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)", display: { xs: "none", md: "inline" } }}>
                {account.email}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={handleSignOut}
                sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.4)", "&:hover": { borderColor: "#fff" } }}>
                Sign out
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Outlet />
    </div>
  );
};

export default Layout;
