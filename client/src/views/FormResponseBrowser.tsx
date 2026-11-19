import { Box, Button, ButtonGroup, Container, FormControlLabel, IconButton, InputAdornment, Paper, Radio, RadioGroup, TextField, Typography } from "@mui/material";
import { useAuth } from "../auth/AuthContext";
import { Close, FilterList, Search } from "@mui/icons-material";
import { useState } from "react";

const FormResponseBrowser = () => {
  const { account } = useAuth();
  if (!account) return null;

  const [search, setSearch] = useState<string | null>(null);

  return (
    <Box component="main" sx={{ bgcolor: "background.default", flex: 1, px: 2, py: { xs: 3, sm: 5 } }}>
      <Box sx={{ maxWidth: 1280, mx: "auto" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 0.5 }}>
          <Paper
            variant="outlined"
            sx={{
                width: "100%",
                maxWidth: 1280,
                p: { xs: 3, sm: 4 },
                borderRadius: 2,
                boxShadow: "0 1px 3px rgba(31, 28, 26, 0.06)",
            }}>
            <Box sx={{display: 'flex', flexDirection: "row", alignItems: 'flex-end', justifyContent: "space-between"}}>
              <Typography variant="h5" component="h1" sx={{m:2}}>
                {"Form Responses"}
              </Typography>
              <ButtonGroup variant="outlined" aria-label="Form button group" sx={{m:2}}>
                <Button>Form A</Button>
                <Button>Form B</Button>
                <Button>Form C</Button>
                <Button>Form D</Button>
              </ButtonGroup>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: "row", alignItems: 'flex-start', p: 1 }}>
              <Box sx={{p: 1}}>
               <TextField
                  fullWidth
                  placeholder="Search by name"
                  value={""}
                  onChange={(e) => setSearch( e.target.value)}
                  slotProps={{
                    htmlInput: { "aria-label": "Search profiles" },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <Box sx={{ display: 'flex', flexDirection: "row", m:1}}>
                  <FilterList sx={{ marginRight:3}}/>
                  <Typography variant="h6" component="h1">
                    {"Filter:"}
                  </Typography>
                </Box>
                <RadioGroup
                  defaultValue="tag"
                  name="filter-group"
                  sx={{ml:3}}
                >
                  <FormControlLabel value="tag" control={<Radio />} label="Tag" />
                  <FormControlLabel value="name" control={<Radio />} label="Name" />
                  <FormControlLabel value="date" control={<Radio />} label="Date" />
                </RadioGroup>
                
              </Box>
              <Box sx={{ p: 1, flexGrow: 1, height: 600, alignSelf: 'stretch'}}>
                <Paper
                variant="outlined"
                sx={{
                    width: "100%",
                    height: "100%",
                    maxHeight: 720,
                    maxWidth: 1280,
                    p: { xs: 3, sm: 4 }
                }}>
                  <p>Table goes here</p>
                </Paper>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default FormResponseBrowser;
