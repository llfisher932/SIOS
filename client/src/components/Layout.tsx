import { AppBar, Divider, Toolbar, Typography } from "@mui/material";
import { Outlet } from "react-router";
import BrandMark from "./BrandMark";
import { brand } from "../theme";
import { useAuth } from "../auth/AuthContext";

// Shared page frame: brand header on every page, plus account info once signed in.
const Layout = () => {
  const { account } = useAuth();

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
            <Typography
              component="span"
              sx={{ ml: "auto", fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)", display: { xs: "none", md: "inline" } }}>
              {account.email}
            </Typography>
          )}
        </Toolbar>
      </AppBar>
      <Outlet />
    </div>
  );
};

export default Layout;
