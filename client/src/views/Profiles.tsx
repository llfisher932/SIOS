import { useEffect, useState } from "react";
import { Box, Chip, Paper, Typography } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";
import { Link as RouterLink } from "react-router";
import { listProfiles, ROLE_LABELS } from "../api/api";
import type { ProfileListItem } from "../api/api";
import PageShell from "../components/PageShell";
import LoadState from "../components/LoadState";

const kindLabel = (item: ProfileListItem) => (item.role ? ROLE_LABELS[item.role] : "Parent");

// Temporary list until the Profile Search story replaces it.
const Profiles = () => {
  const [profiles, setProfiles] = useState<ProfileListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setProfiles(await listProfiles());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't load profiles.");
      }
    };
    load();
  }, []);

  return (
    <PageShell>
      <Typography variant="h5" component="h1">
        Profiles
      </Typography>
      {!profiles ? (
        <LoadState error={error} />
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
          {profiles.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 3 }}>
              No profiles yet.
            </Typography>
          ) : (
            <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
              {profiles.map((item) => (
                <Box component="li" key={item.accountId} sx={{ "& + &": { borderTop: 1, borderColor: "divider" } }}>
                  <Box
                    component={RouterLink}
                    to={`/profiles/${item.accountId}`}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      px: 3,
                      py: 1.75,
                      color: "inherit",
                      textDecoration: "none",
                      "&:hover": { bgcolor: "action.hover" },
                    }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {item.firstName} {item.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {item.email}
                      </Typography>
                    </Box>
                    <Chip label={kindLabel(item)} size="small" variant="outlined" />
                    <ChevronRight sx={{ color: "text.secondary" }} />
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      )}
    </PageShell>
  );
};

export default Profiles;
