import { Box, Chip, Typography } from "@mui/material";
import { useAuth } from "../auth/AuthContext";

const ROLE_LABELS = {
  PARENT: "Parent",
  STAFF: "Staff",
} as const;

const Home = () => {
  const { account } = useAuth();
  if (!account) return null;

  return (
    <Box component="main" sx={{ bgcolor: "background.default", flex: 1, px: 2, py: { xs: 3, sm: 5 } }}>
      <Box sx={{ maxWidth: 960, mx: "auto" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 0.5 }}>
          <Typography variant="h5" component="h1">
            Welcome back
          </Typography>
          <Chip label={ROLE_LABELS[account.type]} size="small" variant="outlined" />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Signed in as {account.email}
        </Typography>
      </Box>
    </Box>
  );
};

export default Home;
