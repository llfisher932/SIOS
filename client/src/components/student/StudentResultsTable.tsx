import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router";
import { displayStudentId, studentAge } from "../../api/api";
import type { StudentListItem } from "../../api/api";
import StudentStatusChip from "./StudentStatusChip";
import DeleteStudent from "./DeleteStudent";

// canManage adds the admin actions: Edit and the delete icon.
const StudentResultsTable = ({
  students,
  canManage,
  onDeleted,
}: {
  students: StudentListItem[];
  canManage: boolean;
  onDeleted: (id: number) => void;
}) => (
  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
    <Table size="small" sx={{ "& td, & th": { py: 1.25 } }}>
      <TableHead sx={{ bgcolor: "action.hover" }}>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Student ID</TableCell>
          <TableCell>Program</TableCell>
          <TableCell>Age / Grade</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Last Update</TableCell>
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.id} hover>
            <TableCell>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {student.firstName} {student.lastName}
              </Typography>
            </TableCell>
            <TableCell>{displayStudentId(student.id)}</TableCell>
            <TableCell>
              {student.program} ({student.site})
            </TableCell>
            <TableCell>
              {studentAge(student.dateOfBirth)} / {student.grade ?? "—"}
            </TableCell>
            <TableCell>
              <StudentStatusChip status={student.status} />
            </TableCell>
            <TableCell>{new Date(student.updatedAt).toLocaleDateString()}</TableCell>
            <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
              <Button
                component={RouterLink}
                to={`/students/${student.id}`}
                variant="contained"
                size="small"
                aria-label={`View ${student.firstName} ${student.lastName}`}>
                View
              </Button>
              {canManage && (
                <>
                  <Button
                    component={RouterLink}
                    to={`/students/${student.id}/edit`}
                    variant="outlined"
                    size="small"
                    sx={{ ml: 1 }}
                    aria-label={`Edit ${student.firstName} ${student.lastName}`}>
                    Edit
                  </Button>
                  <DeleteStudent student={student} trigger="icon" onDeleted={() => onDeleted(student.id)} />
                </>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default StudentResultsTable;
