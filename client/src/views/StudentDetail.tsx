import { useEffect, useState } from "react";
import { Avatar, Box, Button, Link, Paper, Tab, Tabs, Typography } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { Link as RouterLink, useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { canManageStudents, displayStudentId, getStudent, studentAge } from "../api/api";
import type { Student } from "../api/api";
import { useAuth } from "../auth/AuthContext";
import PageShell from "../components/PageShell";
import LoadState from "../components/LoadState";
import ProfileField from "../components/profile/ProfileField";
import StudentStatusChip from "../components/student/StudentStatusChip";
import DeleteStudent from "../components/student/DeleteStudent";

// Dates are stored as UTC midnight; read the date part only so they don't shift a day in local time.
const date = (value: string) => new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString();

// Records, Attendance, Behavior and Trends come with later use cases.
const PLACEHOLDER_TABS = ["Records", "Attendance", "Behavior", "Trends"];

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account } = useAuth();
  const canManage = account !== null && canManageStudents(account);
  const [student, setStudent] = useState<Student | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    let ignore = false; // a slow response for the previous id shouldn't overwrite this one
    const load = async () => {
      setStudent(null);
      setError(null);
      try {
        const result = await getStudent(Number(id));
        if (!ignore) setStudent(result);
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : "Couldn't load this student.");
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  const handleDeleted = () => {
    toast.success("Student deleted.");
    navigate("/students");
  };

  return (
    <PageShell>
      <Link
        component={RouterLink}
        to="/students"
        variant="body2"
        sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, alignSelf: "flex-start" }}>
        <ArrowBack fontSize="small" />
        Back to Students
      </Link>

      {!student ? (
        <LoadState error={error} />
      ) : (
        <Paper variant="outlined" sx={{ p: { xs: 3, sm: 4 }, borderRadius: 2 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, mb: 1 }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: "action.selected", color: "text.primary" }}>
              {student.firstName[0]}
              {student.lastName[0]}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 220 }}>
              <Typography variant="h5" component="h1">
                {student.firstName} {student.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Student ID: {displayStudentId(student.id)} • Age {studentAge(student.dateOfBirth)}
                {student.grade && ` • Grade ${student.grade}`} • Program: {student.program} ({student.site}) • Enrolled{" "}
                {date(student.enrollmentDate)}
              </Typography>
            </Box>
            <StudentStatusChip status={student.status} />
            {canManage && (
              <Box sx={{ display: "flex", gap: 1.25 }}>
                <Button
                  component={RouterLink}
                  to={`/students/${student.id}/edit`}
                  variant="outlined"
                  size="small">
                  Edit Profile
                </Button>
                <DeleteStudent student={student} trigger="button" onDeleted={handleDeleted} />
              </Box>
            )}
          </Box>

          <Tabs value={tab} onChange={(_e, value) => setTab(value)} sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tab label="Overview" />
            {PLACEHOLDER_TABS.map((label) => (
              <Tab key={label} label={label} disabled />
            ))}
          </Tabs>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2.5 }}>
            <ProfileField label="Date of birth">{date(student.dateOfBirth)}</ProfileField>
            <ProfileField label="Gender">{student.gender}</ProfileField>
            <ProfileField label="School">{student.school}</ProfileField>
            <ProfileField label="Guardian">{student.guardianName}</ProfileField>
            <ProfileField label="Guardian phone">{student.guardianPhone}</ProfileField>
            <ProfileField label="Guardian email">{student.guardianEmail}</ProfileField>
            <ProfileField label="Emergency contact">
              {student.emergencyContactName &&
                `${student.emergencyContactName}${
                  student.emergencyContactRelationship ? ` (${student.emergencyContactRelationship})` : ""
                }`}
            </ProfileField>
            <ProfileField label="Emergency contact phone">{student.emergencyContactPhone}</ProfileField>
            <ProfileField label="Linked parent accounts">
              {student.parents.length > 0 &&
                student.parents.map((parent) => `${parent.firstName} ${parent.lastName}`).join(", ")}
            </ProfileField>
            <Box sx={{ gridColumn: "1 / -1" }}>
              <ProfileField label="Medical notes / allergies (staff only)">{student.medicalNotes}</ProfileField>
            </Box>
          </Box>
        </Paper>
      )}
    </PageShell>
  );
};

export default StudentDetail;
