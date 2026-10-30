import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { deleteStudent, displayStudentId } from "../../api/api";

type Props = {
  student: { id: number; firstName: string; lastName: string };
  // Icon in the directory rows, button on the profile header.
  trigger: "icon" | "button";
  onDeleted: () => void;
};

// The admin has to type the student's name before Delete enables (see use case 3.1.2).
const DeleteStudent = ({ student, trigger, onDeleted }: Props) => {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fullName = `${student.firstName} ${student.lastName}`;
  const nameMatches = typed.trim().toLowerCase() === fullName.toLowerCase();

  const close = () => {
    if (submitting) return;
    setOpen(false);
    setTyped("");
    setError(null);
  };

  const confirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await deleteStudent(student.id);
      setOpen(false);
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete this student.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {trigger === "icon" ? (
        <Tooltip title="Delete student">
          <IconButton size="small" aria-label={`Delete ${fullName}`} onClick={() => setOpen(true)}>
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : (
        <Button variant="outlined" color="error" size="small" onClick={() => setOpen(true)}>
          Delete Student
        </Button>
      )}

      <Dialog open={open} onClose={close} aria-labelledby="delete-student-title" maxWidth="sm" fullWidth>
        <DialogTitle id="delete-student-title" sx={{ fontWeight: 700, pb: 1 }}>
          Delete student?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are about to delete {fullName} ({displayStudentId(student.id)}). Their profile, records, attendance,
            and behavior reports will be removed from the directory, reports, and parent views. A Super Admin can
            restore archived students.
          </DialogContentText>
          <TextField
            fullWidth
            label="Type the student's name to confirm"
            placeholder={fullName}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={submitting}
            sx={{ mt: 3 }}
          />
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
          <Button variant="contained" color="error" onClick={confirm} disabled={!nameMatches || submitting}>
            {submitting ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteStudent;
