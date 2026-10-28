import type { ReactNode } from "react";
import { Box } from "@mui/material";

const PageShell = ({ children }: { children: ReactNode }) => (
  <Box component="main" sx={{ bgcolor: "background.default", flex: 1, px: 2, py: { xs: 3, sm: 5 } }}>
    <Box sx={{ maxWidth: 880, mx: "auto", display: "flex", flexDirection: "column", gap: 3 }}>{children}</Box>
  </Box>
);

export default PageShell;
