import { useState } from "react";
import { AppBar, Box, Button, Divider, ListItemIcon, Menu, MenuItem, Toolbar, Typography } from "@mui/material";
import { AccountCircle, ExpandMore, Person } from "@mui/icons-material";
import { Outlet, useNavigate } from "react-router";
import BrandMark from "./BrandMark";
import { brand } from "../theme";
import { useAuth } from "../auth/AuthContext";

// Shared page frame: brand header on every page, plus account info once signed in.
const Layout = () => {
  const { account } = useAuth();
  const navigate = useNavigate();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const closeMenu = () => setMenuAnchor(null);

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
            <>
              <Button
                id="account-menu-button"
                aria-controls={menuAnchor ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={menuAnchor ? "true" : undefined}
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                startIcon={<AccountCircle />}
                endIcon={<ExpandMore />}
                sx={{ ml: "auto", color: "rgba(255,255,255,0.85)", fontSize: "0.8125rem", fontWeight: 500 }}>
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                  {account.email}
                </Box>
              </Button>
              <Menu
                id="account-menu"
                anchorEl={menuAnchor}
                open={!!menuAnchor}
                onClose={closeMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{ list: { "aria-labelledby": "account-menu-button" } }}>
                <MenuItem
                  onClick={() => {
                    closeMenu();
                    navigate("/profile");
                  }}>
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Outlet />
    </div>
  );
};

export default Layout;
