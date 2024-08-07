import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: `'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
  },
  fontSizes: {
    sm: ["12px", "14px", "16px"], // Add responsive sizes
    md: ["14px", "16px", "18px"],
    lg: ["16px", "18px", "20px"],
    xl: ["18px", "20px", "24px"],
  },
  components: {
    // Override or add component-specific styles
    Text: {
      baseStyle: {
        fontSize: ["14px", "16px", "18px"], // Responsive font size for Text component
      },
    },
    Heading: {
      baseStyle: {
        fontSize: ["24px", "28px", "32px"], // Responsive font size for Heading component
      },
    },
  },
});

export default theme;
