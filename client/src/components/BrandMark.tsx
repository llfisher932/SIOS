import { Box } from "@mui/material";
import { brand } from "../theme";

// Placeholder mark until the client sends real brand assets.
// Swap the inner content for an <img src={logo} /> when we have one.
const BrandMark = ({ size = 28 }: { size?: number }) => {
  return (
    <Box
      aria-hidden="true"
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: 1,
        bgcolor: brand.red,
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize: size * 0.42,
        letterSpacing: "-0.02em",
      }}>
      TN
    </Box>
  );
};

export default BrandMark;
