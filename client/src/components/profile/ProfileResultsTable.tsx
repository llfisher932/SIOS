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
import { ROLE_LABELS } from "../../api/api";
import type { ProfileListItem } from "../../api/api";
import StatusChip from "./StatusChip";

const kindLabel = (item: ProfileListItem) =>
  item.role ? ROLE_LABELS[item.role] : "Parent";

// detailed adds the super admin columns: type, site, team and status.
const ProfileResultsTable = ({
  profiles,
  detailed,
}: {
  profiles: ProfileListItem[];
  detailed: boolean;
}) => (
  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
    <Table size="small" sx={{ "& td, & th": { py: 1.25 } }}>
      <TableHead sx={{ bgcolor: "action.hover" }}>
        <TableRow>
          <TableCell>Name</TableCell>
          {detailed && (
            <>
              <TableCell>Profile type</TableCell>
              <TableCell>Site</TableCell>
              <TableCell>Team</TableCell>
              <TableCell>Status</TableCell>
            </>
          )}
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        {profiles.map((item) => (
          <TableRow key={item.accountId} hover>
            <TableCell>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {item.firstName} {item.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.email}
              </Typography>
            </TableCell>
            {detailed && (
              <>
                <TableCell>{kindLabel(item)}</TableCell>
                <TableCell>{item.site ?? "—"}</TableCell>
                <TableCell>{item.team ?? "—"}</TableCell>
                <TableCell>
                  {item.status && <StatusChip status={item.status} />}
                </TableCell>
              </>
            )}
            <TableCell align="right">
              <Button
                component={RouterLink}
                to={`/profiles/${item.accountId}`}
                variant="contained"
                size="small"
                aria-label={`View ${item.firstName} ${item.lastName}`}
              >
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default ProfileResultsTable;
