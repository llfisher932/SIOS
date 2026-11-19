import { useEffect, useState } from "react";
import { Link } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { Link as RouterLink, useParams } from "react-router";
import { getMyProfile, getProfile } from "../api/api";
import type { ParentProfile, StaffProfile } from "../api/api";
import { useAuth } from "../auth/AuthContext";
import PageShell from "../components/PageShell";
import LoadState from "../components/LoadState";
import ParentProfileCard from "../components/profile/ParentProfileCard";
import StaffProfileCard from "../components/profile/StaffProfileCard";
import DeactivateProfile from "../components/profile/DeactivateProfile";

// /profile shows your own; /profiles/:id shows someone else's. The server decides what's visible.
const ProfileDetail = () => {
  const { id } = useParams();
  const { account } = useAuth();
  const [profile, setProfile] = useState<ParentProfile | StaffProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false; // a slow response for the previous id shouldn't overwrite this one
    const load = async () => {
      setProfile(null);
      setError(null);
      try {
        const result = id ? await getProfile(Number(id)) : await getMyProfile();
        if (!ignore) setProfile(result);
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : "Couldn't load this profile.");
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  const title = (p: ParentProfile | StaffProfile) =>
    id ? `${p.firstName} ${p.lastName}` : `Hello, ${p.firstName} ${p.lastName}`;

  // Never on your own profile, even when opened by id.
  const canDeactivate =
    account?.role === "SUPER_ADMIN" &&
    profile !== null &&
    profile.accountId !== account.id &&
    profile.status !== undefined &&
    profile.status !== "INACTIVE";
  const actions = canDeactivate && <DeactivateProfile profile={profile} onDeactivated={setProfile} />;

  return (
    <PageShell>
      {id && (
        <Link
          component={RouterLink}
          to="/profiles"
          variant="body2"
          sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, alignSelf: "flex-start" }}>
          <ArrowBack fontSize="small" />
          Profile search
        </Link>
      )}
      {!profile ? (
        <LoadState error={error} />
      ) : profile.kind === "STAFF" ? (
        <StaffProfileCard profile={profile} title={title(profile)} actions={actions} />
      ) : (
        <ParentProfileCard profile={profile} title={title(profile)} actions={actions} />
      )}
    </PageShell>
  );
};

export default ProfileDetail;
