import { Box, Divider, Paper, Typography } from "@mui/material";
import type { ParentProfile } from "../../api/api";
import ProfileCard from "./ProfileCard";
import ProfileField from "./ProfileField";
import StatusChip from "./StatusChip";
import ContactList from "./ContactList";
import PhoneNumber from "./PhoneNumber";

// Address and status only render when the server sent them.
const ParentProfileCard = ({ profile, title }: { profile: ParentProfile; title: string }) => (
  <>
    <ProfileCard title={title}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 }}>
        <ProfileField label="Name">
          {profile.firstName} {profile.lastName}
        </ProfileField>
        <ProfileField label="Email">{profile.email}</ProfileField>
        <ProfileField label="Phone number">{profile.phone && <PhoneNumber digits={profile.phone} />}</ProfileField>
        {profile.address !== undefined && <ProfileField label="Address">{profile.address}</ProfileField>}
        {profile.status && (
          <ProfileField label="Status">
            <StatusChip status={profile.status} />
          </ProfileField>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" component="h2" sx={{ fontWeight: 650 }}>
        Contacts
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Emergency contacts and the people allowed to pick up students.
      </Typography>
      <ContactList contacts={profile.contacts} />
    </ProfileCard>

    {/* Replaced once student records exist. */}
    <Paper variant="outlined" sx={{ p: { xs: 3, sm: 4 }, borderRadius: 2 }}>
      <Typography variant="h6" component="h2" sx={{ fontWeight: 650, mb: 1 }}>
        Students
      </Typography>
      <Typography variant="body2" color="text.secondary">
        No students are linked to this profile yet.
      </Typography>
    </Paper>
  </>
);

export default ParentProfileCard;
