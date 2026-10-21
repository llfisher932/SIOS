import { useState } from "react";
import type { FormEvent } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { Visibility, VisibilityOff } from "@mui/icons-material";

type FieldErrors = {
  pass1?: string;
  pass2?: string;
};

type ForgotProps = {
  // Called with credentials once the form passes client-side validation.
  // Should throw (or reject) with a user-facing message on failure.
  onForgotPassReset?: (pass1: string, pass2: string) => Promise<void>;
};

const mockForgotPassReset = async (pass1: string, pass2: string) => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  if (pass1 !== pass2 && pass1 !== "") {
    throw new Error("Invalid password, please change and try again.");
  }
  console.log("Password updated! Please return to the login screen.");
};

const Forgotpassreset = ({ onForgotPassReset = mockForgotPassReset }: ForgotProps) => {
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword1, setShowPassword1] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Uses the browser's built-in constraint validation (type="email" + required).
  // noValidate on the form only suppresses the native popups; validity is still computed.
  const validate = (form: HTMLFormElement): FieldErrors => {
    const errors: FieldErrors = {};
    const pass1Input = form.elements.namedItem("password1") as HTMLInputElement;
    const pass2Input = form.elements.namedItem("password2") as HTMLInputElement;

    if (pass1Input.validity.valueMissing) {
      errors.pass1 = "Enter a new password.";
    } else if (pass1Input.value.length < 8) {
      errors.pass1 = "Please enter a password of at least 8 characters. (we can talk about other reqs later if we want)";
    } else if (pass2Input.value !== pass1Input.value) {
      errors.pass2 = "Please enter the same password as in the previous box."
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
      await onForgotPassReset(password1.trim(), password2.trim());
      toast.success("Password updated! Please return to the login screen.");
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
            Reset password (2!)
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              id="login-password"
              name="password1"
              label="Password"
              type={showPassword1 ? "text" : "password"}
              required
              fullWidth
              margin="normal"
              value={password1}
              onChange={(e) => setPassword1(e.target.value)}
              error={!!fieldErrors.pass1}
              helperText={fieldErrors.pass1}
              disabled={submitting}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword1 ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword1((s) => !s)}
                        edge="end">
                        {showPassword1 ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              id="login-password"
              name="password2"
              label="Confirm Password"
              type="password"
              required
              fullWidth
              margin="normal"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              error={!!fieldErrors.pass2}
              helperText={fieldErrors.pass2}
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
              {submitting ? "Updating Password..." : "Update Password"}
            </Button>
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

export default Forgotpassreset;
