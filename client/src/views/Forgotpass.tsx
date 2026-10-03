import { useState } from "react";
import type { FormEvent } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { toast } from "react-toastify";

type FieldErrors = {
  email?: string;
};

type ForgotProps = {
  // Called with credentials once the form passes client-side validation.
  // Should throw (or reject) with a user-facing message on failure.
  onForgotPass?: (email: string) => Promise<void>;
};

const mockForgotPass = async (email: string) => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  if (email !== "test@test.com") {
    throw new Error("There is not an account with that email. Please try again.");
  }
  console.log("Password retrieved for ", email);
};

const Forgotpass = ({ onForgotPass = mockForgotPass }: ForgotProps) => {
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Uses the browser's built-in constraint validation (type="email" + required).
  // noValidate on the form only suppresses the native popups; validity is still computed.
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validate(e.currentTarget);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await onForgotPass(email.trim());
      toast.success("An email has been sent to "+email.trim()+" to reset your password.");
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
            An email will be sent to the email given to reset your password.
          </Typography>
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
