import { useState } from "react";
import type { SubmitEvent } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { Link as RouterLink } from "react-router";
import { requestPasswordReset } from "../api/api";

type FieldErrors = {
  email?: string;
};

const Forgotpass = () => {
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // noValidate hides the native popups; the browser still computes validity.
  const validate = (form: HTMLFormElement): FieldErrors => {
    const errors: FieldErrors = {};
    const emailInput = form.elements.namedItem("email") as HTMLInputElement;

    if (emailInput.validity.valueMissing) {
      errors.email = "Enter your email address.";
    } else if (emailInput.validity.typeMismatch) {
      errors.email = "Enter a valid email address, like name@example.com.";
    }
    return errors;
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validate(e.currentTarget);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      toast.success(await requestPasswordReset(email.trim()));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
      <Box
        component="main"
        sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", px: 2, py: 4 }}>
        <Paper
          variant="outlined"
          sx={{
            width: "100%",
            maxWidth: 400,
            p: { xs: 3, sm: 4 },
            borderRadius: 2,
            boxShadow: "0 1px 3px rgba(31, 28, 26, 0.06)",
          }}>
          <Typography variant="h5" component="h1">
            Reset password
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              id="email"
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
              required
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              disabled={submitting}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
              sx={{ mt: 2.5, py: 1.25 }}>
              {submitting ? "Sending reset email..." : "Send reset email"}
            </Button>
          </Box>

          <Divider sx={{ mt: 3, mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Enter the email you sign in with and we'll send you a link to choose a new password.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Back to sign in
            </Link>
          </Box>
        </Paper>
      </Box>

      <Box
        component="footer"
        sx={{
          px: 2,
          py: 2.5,
          borderTop: 1,
          borderColor: "divider",
          textAlign: "center",
          color: "text.secondary",
          fontSize: "0.75rem",
        }}></Box>
    </Box>
  );
};

export default Forgotpass;
