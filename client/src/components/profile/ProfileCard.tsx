import type { ReactNode } from "react";
import { Box, Paper, Typography } from "@mui/material";

// actions sit beside the title, e.g. Deactivate.
const ProfileCard = ({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) => (
  <Paper variant="outlined" sx={{ p: { xs: 3, sm: 4 }, borderRadius: 2 }}>
    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5, mb: 3 }}>
      <Typography variant="h5" component="h1" sx={{ flex: 1 }}>
        {title}
      </Typography>
      {actions && <Box sx={{ display: "flex", gap: 1.25 }}>{actions}</Box>}
    </Box>
    {children}
  </Paper>
);

export default ProfileCard;
