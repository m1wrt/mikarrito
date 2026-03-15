import { CssVarsProvider, extendTheme, useColorScheme } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          solidBg: "#E96479",
          solidHoverBg: "#d85569",
          plainColor: "#E96479",
          softBg: "rgba(233, 100, 121, 0.1)",
          softHoverBg: "rgba(233, 100, 121, 0.2)",
        },
        background: {
          body: "#F0F2F5",
          surface: "#FFFFFF",
        },
        text: {
          primary: "#1C1E21",
          secondary: "#65676B",
        }
      },
    },
    dark: {
      palette: {
        primary: {
          solidBg: "#E96479",
          solidHoverBg: "#f07588",
          plainColor: "#E96479",
          softBg: "rgba(233, 100, 121, 0.2)",
          softHoverBg: "rgba(233, 100, 121, 0.3)",
        },
        background: {
          body: "#18191A",
          surface: "#242526",
          level1: "#3A3B3C",
        },
        text: {
          primary: "#E4E6EB",
          secondary: "#B0B3B8",
        }
      },
    },
  },
  fontFamily: {
    body: "Inter, var(--joy-fontFamily-fallback)",
  },
  components: {
    JoyCard: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          border: "1px solid",
          borderColor: "var(--joy-palette-divider)",
          borderRadius: "0px", // Keep cards square as requested before, only media is rounded
          padding: "12px",
        },
      },
    },
    JoyButton: {
      styleOverrides: {
        root: {
          borderRadius: "0px",
          fontWeight: "600",
        }
      }
    },
    // Avatars will be circular by default now
  },
});

export const useColorMode = () => {
  const { mode, setMode } = useColorScheme();
  return {
    mode,
    toggleColorMode: () => setMode(mode === "light" ? "dark" : "light"),
  };
};

export function CustomThemeProvider({ children }) {
  return (
    <CssVarsProvider theme={theme} defaultMode="light" modeStorageKey="mikarrrito-theme-mode">
      <CssBaseline />
      {children}
    </CssVarsProvider>
  );
}
