import { Box, Paper, Stack, Typography } from "@mui/material";
import { useAuth } from "../auth/AuthContext";
import { Link, useParams } from "react-router";
import { useEffect, useState } from "react";
import { getFormResponse, type FormResponse } from "../api/api";
import LoadState from "../components/LoadState";

const FormResponseView = () => {
  const { account } = useAuth();
  if (!account) return null;

  const { id } = useParams();
  const [response, setResponse] = useState<FormResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const load = async () => {
      setResponse(null);
      setError(null);
      try {
        const result = await getFormResponse(Number(id));
        setResponse(result);
        console.log(JSON.stringify(result))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load this response.");
      }
    };
    load();
  }, [id]);

  if (!response) return (
    <Box component="main" sx={{ bgcolor: "background.default", flex: 1, px: 2, py: { xs: 3, sm: 5 } }}>
      <Box sx={{ maxWidth: 960, mx: "auto" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 0.5 }}>
          <Typography variant="h5" component="h1">
            <LoadState error={error} />
          </Typography>
        </Box>
      </Box>
    </Box>
  ) 

  return (
    <Box component="main" sx={{ bgcolor: "background.default", flex: 1, px: 2, py: { xs: 3, sm: 5 } }}>
      <Box sx={{ maxWidth: 960, mx: "auto" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 0.5 }}>
          <Stack spacing={2}>
            <Typography variant="h5" component="h1">
              {response.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Assigned to <Link to={"/profiles/"+response.userID}>{response.assignedName}</Link> at {new Date(response.assignedAt).toLocaleDateString('en-US')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Marked as {response.status}
            </Typography>
            {response.formResponseQuestions.map((formResponseQuestion, index) => (
              <Paper
                variant="outlined"
                sx={{
                    width: "100%",
                    maxWidth: 1280,
                    p: { xs: 3, sm: 4 },
                    borderRadius: 2,
                    boxShadow: "0 1px 3px rgba(31, 28, 26, 0.06)",
              }}>
                <Typography variant="body1" color="text.primary" sx={{ mb: 4 }}>
                  <b>{index+1}. {formResponseQuestion.questionText}</b>
                </Typography>
                {formResponseQuestion.answerText}
              </Paper>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default FormResponseView;
