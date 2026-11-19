import { useState } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { deactivateProfile } from "../../api/api";
import type { ParentProfile, StaffProfile } from "../../api/api";

type Props = {
  profile: ParentProfile | StaffProfile;
  onDeactivated: (profile: ParentProfile | StaffProfile) => void;
};

// Header button plus its confirmation. Super admins only, never on their own profile; the server enforces both.
const DeactivateProfile = ({ profile, onDeactivated }: Props) => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    if (submitting) return;
    setOpen(false);
    setError(null);
  };

  const confirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      onDeactivated(await deactivateProfile(profile.accountId));
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't deactivate this profile.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button variant="outlined" color="error" size="small" onClick={() => setOpen(true)}>
        Deactivate
      </Button>

      <Dialog open={open} onClose={close} aria-labelledby="deactivate-title" maxWidth="sm" fullWidth>
        <DialogTitle id="deactivate-title" sx={{ fontWeight: 700, pb: 1 }}>
          Deactivate Profile
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to deactivate {profile.firstName} {profile.lastName}'s profile? They will no longer be
            able to sign in to SIOS. This can't be undone.
          </DialogContentText>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 0.5 }}>
          <Button variant="outlined" color="inherit" onClick={close} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="outlined" color="error" onClick={confirm} disabled={submitting}>
            {submitting ? "Deactivating…" : "Deactivate"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeactivateProfile;
