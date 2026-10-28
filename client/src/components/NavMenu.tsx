import { useId, useState } from "react";
import { Button, Menu, MenuItem } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { Link as RouterLink } from "react-router";

export type NavItem = { label: string; to: string };

// A navbar dropdown. With no items it shows a disabled placeholder.
const NavMenu = ({ label, items }: { label: string; items: NavItem[] }) => {
  const id = useId();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const close = () => setAnchor(null);

  return (
    <>
      <Button
        id={`${id}-button`}
        aria-controls={anchor ? `${id}-menu` : undefined}
        aria-haspopup="true"
        aria-expanded={anchor ? "true" : undefined}
        onClick={(e) => setAnchor(e.currentTarget)}
        endIcon={<ExpandMore />}
        sx={{ flexShrink: 0, color: "rgba(255,255,255,0.85)", fontSize: "0.8125rem", fontWeight: 500 }}>
        {label}
      </Button>
      <Menu
        id={`${id}-menu`}
        anchorEl={anchor}
        open={!!anchor}
        onClose={close}
        slotProps={{ list: { "aria-labelledby": `${id}-button` } }}>
        {items.length === 0 ? (
          <MenuItem disabled>Coming soon</MenuItem>
        ) : (
          items.map((item) => (
            <MenuItem key={item.to} component={RouterLink} to={item.to} onClick={close}>
              {item.label}
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NavMenu;
