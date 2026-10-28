import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";

const ProfileField = ({ label, children }: { label: string; children: ReactNode }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" component="div">
      {label}
    </Typography>
    <Typography variant="body1" component="div">
      {children || (
        <Box component="span" sx={{ color: "text.disabled" }}>
          Not provided
        </Box>
      )}
    </Typography>
  </Box>
);

export default ProfileField;
