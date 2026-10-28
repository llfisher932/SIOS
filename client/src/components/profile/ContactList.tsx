import { Box, Chip, Typography } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import type { Contact } from "../../api/api";
import PhoneNumber from "./PhoneNumber";

const ContactList = ({ contacts }: { contacts: Contact[] }) => {
  if (contacts.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
        No contacts on file.
      </Typography>
    );
  }

  return (
    <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
      {contacts.map((contact) => (
        <Box
          component="li"
          key={contact.id}
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            py: 1.75,
            borderBottom: 1,
            borderColor: "divider",
            "&:last-of-type": { borderBottom: 0 },
          }}>
          <Box sx={{ flex: "1 1 200px", minWidth: 0 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {contact.firstName} {contact.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {contact.relationship} · <PhoneNumber digits={contact.phone} />
            </Typography>
          </Box>
          {contact.authorizedPickup ? (
            <Chip icon={<CheckCircle />} label="Authorized pickup" size="small" color="success" variant="outlined" />
          ) : (
            <Chip label="Not authorized for pickup" size="small" variant="outlined" />
          )}
        </Box>
      ))}
    </Box>
  );
};

export default ContactList;
