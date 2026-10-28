import { Alert, Box, CircularProgress } from "@mui/material";

// Spinner while loading, or the error once it fails.
const LoadState = ({ error }: { error: string | null }) =>
  error ? (
    <Alert severity="error">{error}</Alert>
  ) : (
    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
      <CircularProgress aria-label="Loading" />
    </Box>
  );

export default LoadState;
