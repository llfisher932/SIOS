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

type LoginProps = {
  // Called with credentials once the form passes client-side validation.
  // Should throw (or reject) with a user-facing message on failure.
  onLogin?: (email: string, password: string) => Promise<void>;
};

type FieldErrors = {
  email?: string;
  password?: string;
};

const mockLogin = async (email: string, password: string) => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  if (password !== "password") {
    throw new Error("That email and password combination didn't match our records.");
  }
  if (email !== "test@test.com") {
    throw new Error("That email and password combination didn't match our records.");
  }
  console.log("Signed in as", email);
};

const Login = ({ onLogin = mockLogin }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Uses the browser's built-in constraint validation (type="email" + required).
  // noValidate on the form only suppresses the native popups; validity is still computed.
  const validate = (form: HTMLFormElement): FieldErrors => {
    const errors: FieldErrors = {};
    const emailInput = form.elements.namedItem("email") as HTMLInputElement;
    const passwordInput = form.elements.namedItem("password") as HTMLInputElement;

    if (emailInput.validity.valueMissing) {
      errors.email = "Enter your email address.";
    } else if (emailInput.validity.typeMismatch) {
      errors.email = "Enter a valid email address, like name@example.com.";
    }
    if (passwordInput.validity.valueMissing) {
      errors.password = "Enter your password.";
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
      await onLogin(email.trim(), password);
      toast.success("Signed in successfully.");
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
            Sign in to SIOS
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
            Student Impact &amp; Outcomes System
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              id="login-email"
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

            <TextField
              id="login-password"
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
              disabled={submitting}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((s) => !s)}
                        edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5 }}>
              {/* should be updated with real forgot URL */}
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
              sx={{ mt: 2.5, py: 1.25 }}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </Box>

          <Divider sx={{ mt: 3, mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Parent accounts are created by our staff after an application is accepted.
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

export default Login;
