import { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Link,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { Link as RouterLink, useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import {
  ApiError,
  createStudent,
  getStudent,
  searchProfiles,
  updateStudent,
  GENDERS,
  GRADES,
  PROGRAMS,
  SITES,
} from "../api/api";
import type { ProfileListItem, StudentInput } from "../api/api";
import PageShell from "../components/PageShell";
import LoadState from "../components/LoadState";
import ProfileCard from "../components/profile/ProfileCard";

const EMPTY_INPUT: StudentInput = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  school: "",
  grade: "",
  program: "",
  site: "",
  enrollmentDate: "",
  status: "ACTIVE",
  guardianName: "",
  guardianPhone: "",
  guardianEmail: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelationship: "",
  medicalNotes: "",
  parentAccountIds: [],
};

type FieldErrors = Partial<Record<keyof StudentInput, string>>;

// Linked parents are shown as chips; this mirrors ProfileListItem but only what the picker needs.
type ParentOption = { accountId: number; label: string };

const toOption = (profile: ProfileListItem): ParentOption => ({
  accountId: profile.accountId,
  label: `${profile.firstName} ${profile.lastName} (${profile.email})`,
});

const phoneDigits = (value: string) => value.replace(/\D/g, "");

// Required fields plus the format checks from use case 4.2; the server repeats them all.
function validate(input: StudentInput): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.firstName.trim()) errors.firstName = "Enter the student's first name.";
  if (!input.lastName.trim()) errors.lastName = "Enter the student's last name.";
  if (!input.dateOfBirth) errors.dateOfBirth = "Enter the student's date of birth.";
  else if (new Date(input.dateOfBirth) > new Date()) errors.dateOfBirth = "Date of birth can't be in the future.";
  if (!input.program) errors.program = "Pick a program.";
  if (!input.site) errors.site = "Pick a site.";
  if (!input.enrollmentDate) errors.enrollmentDate = "Enter the enrollment date.";
  if (!input.guardianName.trim()) errors.guardianName = "Enter the guardian's name.";
  if (phoneDigits(input.guardianPhone).length !== 10) errors.guardianPhone = "Enter a valid 10-digit phone number.";
  if (!/^\S+@\S+\.\S+$/.test(input.guardianEmail.trim())) errors.guardianEmail = "Enter a valid email address.";
  if (input.emergencyContactPhone && phoneDigits(input.emergencyContactPhone).length !== 10)
    errors.emergencyContactPhone = "Enter a valid 10-digit phone number.";
  return errors;
}

// /students/new creates; /students/:id/edit pre-fills the same form (see use case 3.1.1).
const StudentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = id !== undefined;

  const [input, setInput] = useState<StudentInput | null>(editing ? null : EMPTY_INPUT);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);

  // The parent picker searches approved parent accounts by name or email.
  const [parentQuery, setParentQuery] = useState("");
  const [parentOptions, setParentOptions] = useState<ParentOption[]>([]);
  const [linkedParents, setLinkedParents] = useState<ParentOption[]>([]);

  useEffect(() => {
    if (!editing) return;
    let ignore = false;
    const load = async () => {
      try {
        const student = await getStudent(Number(id));
        if (ignore) return;
        setInput({
          firstName: student.firstName,
          lastName: student.lastName,
          dateOfBirth: student.dateOfBirth.slice(0, 10),
          gender: student.gender ?? "",
          school: student.school ?? "",
          grade: student.grade ?? "",
          program: student.program,
          site: student.site,
          enrollmentDate: student.enrollmentDate.slice(0, 10),
          status: student.status,
          guardianName: student.guardianName,
          guardianPhone: student.guardianPhone,
          guardianEmail: student.guardianEmail,
          emergencyContactName: student.emergencyContactName ?? "",
          emergencyContactPhone: student.emergencyContactPhone ?? "",
          emergencyContactRelationship: student.emergencyContactRelationship ?? "",
          medicalNotes: student.medicalNotes ?? "",
          parentAccountIds: student.parents.map((parent) => parent.accountId),
        });
        setLinkedParents(
          student.parents.map((parent) => ({
            accountId: parent.accountId,
            label: `${parent.firstName} ${parent.lastName} (${parent.email})`,
          })),
        );
      } catch (err) {
        if (!ignore) setLoadError(err instanceof Error ? err.message : "Couldn't load this student.");
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [editing, id]);

  useEffect(() => {
    let ignore = false;
    // Wait for typing to pause before searching parent accounts.
    const timer = setTimeout(async () => {
      try {
        const profiles = await searchProfiles({ q: parentQuery, type: "PARENT", status: "ACTIVE" });
        if (!ignore) setParentOptions(profiles.filter((p) => p.kind === "PARENT").map(toOption));
      } catch {
        if (!ignore) setParentOptions([]); // the picker just shows no options
      }
    }, 300);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [parentQuery]);

  if (!input) {
    return (
      <PageShell>
        <LoadState error={loadError} />
      </PageShell>
    );
  }

  const set = <K extends keyof StudentInput>(key: K, value: StudentInput[K]) =>
    setInput((current) => (current ? { ...current, [key]: value } : current));

  const setParents = (options: ParentOption[]) => {
    setLinkedParents(options);
    set("parentAccountIds", options.map((option) => option.accountId));
  };

  const save = async (allowDuplicate: boolean) => {
    setSubmitting(true);
    try {
      const payload = {
        ...input,
        guardianPhone: phoneDigits(input.guardianPhone),
        emergencyContactPhone: phoneDigits(input.emergencyContactPhone),
      };
      const student = editing
        ? await updateStudent(Number(id), payload, allowDuplicate)
        : await createStudent(payload, allowDuplicate);
      toast.success(editing ? "Changes saved." : `${student.firstName} ${student.lastName} was added.`);
      navigate(`/students/${student.id}`);
    } catch (err) {
      // 409: a student with the same name and birth date exists — ask before creating anyway.
      if (err instanceof ApiError && err.status === 409) {
        setDuplicateOpen(true);
      } else {
        toast.error(err instanceof Error ? err.message : "Couldn't save this student.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    const errors = validate(input);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    await save(false);
  };

  const field = (key: keyof StudentInput) => ({
    value: input[key] as string,
    onChange: (e: { target: { value: string } }) => set(key, e.target.value),
    error: !!fieldErrors[key],
    helperText: fieldErrors[key],
    disabled: submitting,
    fullWidth: true,
  });

  const section = (label: string) => (
    <>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2 }}>
        {label}
      </Typography>
      <Divider sx={{ mb: 1 }} />
    </>
  );

  const row = { display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 };
  const back = editing ? `/students/${id}` : "/students";

  return (
    <PageShell>
      <Link
        component={RouterLink}
        to={back}
        variant="body2"
        sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, alignSelf: "flex-start" }}>
        <ArrowBack fontSize="small" />
        {editing ? "Back to student" : "Back to Students"}
      </Link>

      <ProfileCard title={editing ? "Edit Student" : "Add Student"}>
        <Typography variant="body2" color="text.secondary" sx={{ mt: -2, mb: 1 }}>
          Fields marked * are required. Linking a parent account approves that parent to view this student's data.
        </Typography>

        {section("Student Information")}
        <Box sx={row}>
          <TextField label="First name" required {...field("firstName")} />
          <TextField label="Last name" required {...field("lastName")} />
          <TextField
            label="Date of birth"
            type="date"
            required
            {...field("dateOfBirth")}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField label="Gender" select {...field("gender")}>
            <MenuItem value="">Select…</MenuItem>
            {GENDERS.map((gender) => (
              <MenuItem key={gender} value={gender}>
                {gender}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="School" {...field("school")} />
          <TextField label="Grade" select {...field("grade")}>
            <MenuItem value="">Select…</MenuItem>
            {GRADES.map((grade) => (
              <MenuItem key={grade} value={grade}>
                {grade}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {section("Program & Enrollment")}
        <Box sx={row}>
          <TextField label="Program / Class" select required {...field("program")}>
            {PROGRAMS.map((program) => (
              <MenuItem key={program} value={program}>
                {program}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Site" select required {...field("site")}>
            {SITES.map((site) => (
              <MenuItem key={site} value={site}>
                {site}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Enrollment date"
            type="date"
            required
            {...field("enrollmentDate")}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField label="Status" select required {...field("status")}>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="INACTIVE">Inactive</MenuItem>
          </TextField>
        </Box>

        {section("Guardian & Emergency Contact")}
        <Box sx={row}>
          <TextField label="Guardian name" required {...field("guardianName")} />
          <TextField label="Guardian phone" required {...field("guardianPhone")} />
          <TextField label="Guardian email" type="email" required {...field("guardianEmail")} />
          <TextField label="Emergency contact name" {...field("emergencyContactName")} />
          <TextField label="Emergency contact phone" {...field("emergencyContactPhone")} />
          <TextField label="Relationship" placeholder="e.g. Aunt" {...field("emergencyContactRelationship")} />
        </Box>

        {section("Linked Parent Accounts")}
        <Autocomplete
          multiple
          options={parentOptions}
          value={linkedParents}
          onChange={(_e, value) => setParents(value)}
          inputValue={parentQuery}
          onInputChange={(_e, value) => setParentQuery(value)}
          isOptionEqualToValue={(option, value) => option.accountId === value.accountId}
          filterOptions={(options) => options.filter((o) => !linkedParents.some((l) => l.accountId === o.accountId))}
          disabled={submitting}
          renderValue={(selected, getItemProps) =>
            selected.map((option, index) => (
              <Chip label={option.label} size="small" {...getItemProps({ index })} key={option.accountId} />
            ))
          }
          renderInput={(params) => (
            <TextField {...params} placeholder="Search approved parent accounts by name or email" />
          )}
        />

        {section("Additional Information")}
        <TextField
          label="Medical notes / allergies (staff only)"
          placeholder="Enter any notes coaches should know…"
          multiline
          minRows={3}
          {...field("medicalNotes")}
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.25, mt: 3 }}>
          <Button component={RouterLink} to={back} variant="outlined" color="inherit" disabled={submitting}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving…" : editing ? "Save Changes" : "Save Student"}
          </Button>
        </Box>
      </ProfileCard>

      <Dialog open={duplicateOpen} onClose={() => setDuplicateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Possible duplicate</DialogTitle>
        <DialogContent>
          <DialogContentText>
            A student with the same name and date of birth already exists. Save {input.firstName} {input.lastName}{" "}
            anyway?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 0.5 }}>
          <Button variant="outlined" color="inherit" onClick={() => setDuplicateOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={submitting}
            onClick={async () => {
              setDuplicateOpen(false);
              await save(true);
            }}>
            Save anyway
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
};

export default StudentForm;
