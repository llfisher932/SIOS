import { useEffect, useState } from "react";
import { Alert, Box, Button, IconButton, InputAdornment, MenuItem, TextField, Typography } from "@mui/material";
import { Add, Close, Search } from "@mui/icons-material";
import { Link as RouterLink } from "react-router";
import { toast } from "react-toastify";
import { canManageStudents, searchStudents, PROGRAMS, SITES, STUDENT_CREATION_ENABLED } from "../api/api";
import type { StudentFilters, StudentListItem } from "../api/api";
import { useAuth } from "../auth/AuthContext";
import PageShell from "../components/PageShell";
import LoadState from "../components/LoadState";
import ProfileCard from "../components/profile/ProfileCard";
import StudentResultsTable from "../components/student/StudentResultsTable";

const DEFAULT_FILTERS: StudentFilters = { q: "", program: "", site: "", status: "ACTIVE" };

const StudentDirectory = () => {
  const { account } = useAuth();
  const canManage = account !== null && canManageStudents(account);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [students, setStudents] = useState<StudentListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setFilter = <K extends keyof StudentFilters>(key: K, value: StudentFilters[K]) =>
    setFilters((current) => ({ ...current, [key]: value }));
  const isDefault = (Object.keys(DEFAULT_FILTERS) as (keyof StudentFilters)[]).every(
    (key) => filters[key] === DEFAULT_FILTERS[key],
  );

  useEffect(() => {
    let ignore = false;
    // Wait for typing to pause before searching.
    const timer = setTimeout(async () => {
      try {
        const result = await searchStudents(filters);
        if (ignore) return;
        setStudents(result);
        setError(null);
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : "Couldn't search students.");
      }
    }, 300);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [filters]);

  const handleDeleted = (id: number) => {
    setStudents((current) => current?.filter((student) => student.id !== id) ?? null);
    toast.success("Student deleted.");
  };

  const actions = canManage && STUDENT_CREATION_ENABLED && (
    <Button component={RouterLink} to="/students/new" variant="contained" size="small" startIcon={<Add />}>
      Add Student
    </Button>
  );

  return (
    <PageShell>
      <ProfileCard title="Students" actions={actions}>
        <Typography variant="body2" color="text.secondary" sx={{ mt: -2, mb: 3 }}>
          Search and filter Team Nitro scholars. Select a student to view their profile, records, attendance, and
          trends.
        </Typography>

        <TextField
          fullWidth
          placeholder="Search by student name or Student ID"
          value={filters.q}
          onChange={(e) => setFilter("q", e.target.value)}
          slotProps={{
            htmlInput: { "aria-label": "Search students" },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: filters.q && (
                <InputAdornment position="end">
                  <IconButton aria-label="Clear search" edge="end" onClick={() => setFilter("q", "")}>
                    <Close />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5, mt: 2 }}>
          <TextField
            select
            size="small"
            label="Program"
            value={filters.program}
            onChange={(e) => setFilter("program", e.target.value)}
            slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
            sx={{ minWidth: 150 }}>
            <MenuItem value="">All</MenuItem>
            {PROGRAMS.map((program) => (
              <MenuItem key={program} value={program}>
                {program}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Site"
            value={filters.site}
            onChange={(e) => setFilter("site", e.target.value)}
            slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
            sx={{ minWidth: 130 }}>
            <MenuItem value="">All sites</MenuItem>
            {SITES.map((site) => (
              <MenuItem key={site} value={site}>
                {site}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Status"
            value={filters.status}
            onChange={(e) => setFilter("status", e.target.value as StudentFilters["status"])}
            slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
            sx={{ minWidth: 120 }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="INACTIVE">Inactive</MenuItem>
          </TextField>
          <Button
            variant="outlined"
            size="small"
            disabled={isDefault}
            onClick={() => setFilters(DEFAULT_FILTERS)}
            sx={{ ml: "auto" }}>
            Clear filters
          </Button>
        </Box>

        <Box sx={{ mt: 3 }}>
          {!students ? (
            <LoadState error={error} />
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }} aria-live="polite">
                {students.length === 1 ? "1 student" : `${students.length} students`}
              </Typography>
              {students.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                  No students match your search.
                </Typography>
              ) : (
                <StudentResultsTable students={students} canManage={canManage} onDeleted={handleDeleted} />
              )}
            </>
          )}
        </Box>
      </ProfileCard>
    </PageShell>
  );
};

export default StudentDirectory;
