import type { ReactNode } from "react";
import { Paper, Typography } from "@mui/material";

const ProfileCard = ({ title, children }: { title: string; children: ReactNode }) => (
  <Paper variant="outlined" sx={{ p: { xs: 3, sm: 4 }, borderRadius: 2 }}>
    <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
      {title}
    </Typography>
    {children}
  </Paper>
);

export default ProfileCard;
