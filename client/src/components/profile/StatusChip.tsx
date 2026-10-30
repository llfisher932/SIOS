import { Chip } from "@mui/material";
import type { AccountStatus } from "../../api/api";

const STATUS_CHIPS: Record<AccountStatus, { label: string; color: "success" | "warning" | "default" }> = {
  ACTIVE: { label: "Active", color: "success" },
  PENDING: { label: "Pending approval", color: "warning" },
  INACTIVE: { label: "Deactivated", color: "default" },
};

const StatusChip = ({ status }: { status: AccountStatus }) => {
  const { label, color } = STATUS_CHIPS[status];
  return <Chip label={label} color={color} size="small" variant="outlined" />;
};

export default StatusChip;
