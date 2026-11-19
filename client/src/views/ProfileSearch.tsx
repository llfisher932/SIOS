import { useEffect, useState } from "react";
import { Alert, Box, Button, IconButton, InputAdornment, MenuItem, TextField, Typography } from "@mui/material";
import { Close, Search } from "@mui/icons-material";
import { searchProfiles } from "../api/api";
import type { ProfileFilters, ProfileListItem } from "../api/api";
import { useAuth } from "../auth/AuthContext";
import PageShell from "../components/PageShell";
import LoadState from "../components/LoadState";
import ProfileCard from "../components/profile/ProfileCard";
import ProfileResultsTable from "../components/profile/ProfileResultsTable";

const DEFAULT_FILTERS: ProfileFilters = { q: "", type: "", status: "ACTIVE" };

const ProfileSearch = () => {
  const { account } = useAuth();
  const superAdmin = account?.role === "SUPER_ADMIN";
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [profiles, setProfiles] = useState<ProfileListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setFilter = <K extends keyof ProfileFilters>(key: K, value: ProfileFilters[K]) =>
    setFilters((current) => ({ ...current, [key]: value }));
  const isDefault = (Object.keys(DEFAULT_FILTERS) as (keyof ProfileFilters)[]).every(
    (key) => filters[key] === DEFAULT_FILTERS[key],
  );

  useEffect(() => {
    let ignore = false;
    // Wait for typing to pause before searching.
    const timer = setTimeout(async () => {
      try {
        const result = await searchProfiles(filters);
        if (ignore) return;
        setProfiles(result);
        setError(null);
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : "Couldn't search profiles.");
      }
    }, 300);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [filters]);

  return (
    <PageShell>
      <ProfileCard title="Profile search">
        <Typography variant="body2" color="text.secondary" sx={{ mt: -2, mb: 3 }}>
          {superAdmin
            ? "Search parent and staff profiles by name or email."
            : "Search parent profiles by name or email."}
        </Typography>

        <TextField
          fullWidth
          placeholder="Search by name or email"
          value={filters.q}
          onChange={(e) => setFilter("q", e.target.value)}
          slotProps={{
            htmlInput: { "aria-label": "Search profiles" },
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

        {superAdmin && (
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5, mt: 2 }}>
            <TextField
              select
              size="small"
              label="Profile type"
              value={filters.type}
              onChange={(e) => setFilter("type", e.target.value as ProfileFilters["type"])}
              slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
              sx={{ minWidth: 150 }}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="PARENT">Parent</MenuItem>
              <MenuItem value="STAFF">Staff</MenuItem>
            </TextField>
            <TextField
              select
              size="small"
              label="Status"
              value={filters.status}
              onChange={(e) => setFilter("status", e.target.value as ProfileFilters["status"])}
              slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
              sx={{ minWidth: 150 }}>
              {/* Deactivated profiles are left out unless chosen here. */}
              <MenuItem value="">Active and pending</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="PENDING">Pending approval</MenuItem>
              <MenuItem value="INACTIVE">Deactivated</MenuItem>
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
        )}

        <Box sx={{ mt: 3 }}>
          {!profiles ? (
            <LoadState error={error} />
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }} aria-live="polite">
                {profiles.length === 1 ? "1 result" : `${profiles.length} results`}
              </Typography>
              {profiles.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                  No profiles match your search.
                </Typography>
              ) : (
                <ProfileResultsTable profiles={profiles} detailed={superAdmin} />
              )}
            </>
          )}
        </Box>
      </ProfileCard>
    </PageShell>
  );
};

export default ProfileSearch;
