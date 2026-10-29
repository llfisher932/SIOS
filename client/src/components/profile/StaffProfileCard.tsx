import type { ReactNode } from "react";
import { Box } from "@mui/material";
import { ROLE_LABELS } from "../../api/api";
import type { StaffProfile } from "../../api/api";
import ProfileCard from "./ProfileCard";
import ProfileField from "./ProfileField";
import StatusChip from "./StatusChip";

// Status only renders when the server sent it.
const StaffProfileCard = ({
  profile,
  title,
  actions,
}: {
  profile: StaffProfile;
  title: string;
  actions?: ReactNode;
}) => (
  <ProfileCard title={title} actions={actions}>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 }}>
      <ProfileField label="Name">
        {profile.firstName} {profile.lastName}
      </ProfileField>
      <ProfileField label="Email">{profile.email}</ProfileField>
      <ProfileField label="Role">{ROLE_LABELS[profile.role]}</ProfileField>
      {profile.status && (
        <ProfileField label="Status">
          <StatusChip status={profile.status} />
        </ProfileField>
      )}
      <ProfileField label="Site location">{profile.site}</ProfileField>
      <ProfileField label="Team assignment">{profile.team}</ProfileField>
    </Box>
  </ProfileCard>
);

export default StaffProfileCard;
