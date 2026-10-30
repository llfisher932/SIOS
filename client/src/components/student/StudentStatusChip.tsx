import { Chip } from "@mui/material";
import type { StudentStatus } from "../../api/api";

const STATUS_CHIPS: Record<StudentStatus, { label: string; color: "success" | "default" }> = {
  ACTIVE: { label: "Active", color: "success" },
  INACTIVE: { label: "Inactive", color: "default" },
};

const StudentStatusChip = ({ status }: { status: StudentStatus }) => {
  const { label, color } = STATUS_CHIPS[status];
  return <Chip label={label} color={color} size="small" variant="outlined" />;
};

export default StudentStatusChip;
