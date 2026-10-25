import { useState } from "react";
import type { SubmitEvent } from "react";
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
import { toast } from "react-toastify";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router";
import { resetPassword } from "../api/api";

// Keep in sync with MIN_PASSWORD_LENGTH on the server.
const MIN_PASSWORD_LENGTH = 8;

type FieldErrors = {
  pass1?: string;
  pass2?: string;
};

const Forgotpassreset = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword1, setShowPassword1] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (form: HTMLFormElement): FieldErrors => {
    const errors: FieldErrors = {};
    const pass1Input = form.elements.namedItem("password1") as HTMLInputElement;
    const pass2Input = form.elements.namedItem("password2") as HTMLInputElement;

    if (pass1Input.validity.valueMissing) {
      errors.pass1 = "Enter a new password.";
    } else if (pass1Input.value.length < MIN_PASSWORD_LENGTH) {
      errors.pass1 = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    } else if (pass2Input.value !== pass1Input.value) {
      errors.pass2 = "Passwords don't match.";
    }
    return errors;
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;

    const errors = validate(e.currentTarget);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      toast.success(await resetPassword(token, password1));
      navigate("/login", { replace: true });
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
            Choose a new password
          </Typography>

          {!token ? (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                This reset link is missing its code. Please use the link from your email, or request a new one.
              </Typography>
              <Button component={RouterLink} to="/forgot-password" variant="contained" fullWidth sx={{ mt: 3 }}>
                Request a new link
              </Button>
            </>
          ) : (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                id="reset-password-new"
                name="password1"
                label="New password"
                type={showPassword1 ? "text" : "password"}
                autoComplete="new-password"
                required
                fullWidth
                margin="normal"
                value={password1}
                onChange={(e) => setPassword1(e.target.value)}
                error={!!fieldErrors.pass1}
                helperText={fieldErrors.pass1 ?? `At least ${MIN_PASSWORD_LENGTH} characters.`}
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
                id="reset-password-confirm"
                name="password2"
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
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
                {submitting ? "Updating password…" : "Update password"}
              </Button>
            </Box>
          )}

          <Divider sx={{ mt: 3, mb: 2 }} />
          <Link component={RouterLink} to="/login" variant="body2">
            Back to sign in
          </Link>
        </Paper>
      </Box>
    </Box>
  );
};

export default Forgotpassreset;
