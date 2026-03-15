import { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
  Avatar,
  ModalDialog,
  Modal
} from "@mui/joy";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useColorMode } from "../context/ThemeContext";

import CreatePost from "./CreatePost";

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { mode, toggleColorMode } = useColorMode();
  const isDark = mode === "dark";

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const list = () => (
    <Box
      sx={{ 
        width: 280, 
        height: "100%", 
        bgcolor: "background.surface",
        p: 0
      }}
      role="presentation"
      onClick={() => setDrawerOpen(false)}
    >
      <List sx={{ p: 1, pt: 0, gap: 0.5 }}>
        {/* Profile Section integrated into the list */}
        <Box sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1.5, p: 1.5, bgcolor: "background.level1" }}>
          <Avatar 
            src={currentUser?.photoURL} 
            variant="circular"
            sx={{ "--Avatar-size": "50px", border: "2px solid", borderColor: "primary.solidBg" }}
          >
            {currentUser?.displayName?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography level="title-sm" fontWeight="900" sx={{ lineHeight: 1.1 }}>{currentUser?.displayName}</Typography>
            <Typography level="body-xs" sx={{ color: "text.secondary" }}>{currentUser?.phoneNumber || currentUser?.email}</Typography>
          </Box>
        </Box>

        {[
          { text: "Feed", icon: <HomeIcon />, path: "/" },
          { text: "Profile", icon: <PersonIcon />, path: `/profile/${currentUser?.uid}` },
        ].map((item) => (
          <ListItem key={item.text}>
            <ListItemButton 
              onClick={() => navigate(item.path)}
              sx={{ borderRadius: "md" }}
            >
              {item.icon}
              <ListItemContent>
                <Typography level="title-sm">{item.text}</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
        ))}
        
        <Box sx={{ mt: 1, borderTop: "1px solid", borderColor: "divider", pt: 1, px: 1 }}>
          <ListItem>
            <ListItemButton 
              onClick={() => {
                toggleColorMode();
              }} 
              sx={{ borderRadius: "md" }}
            >
              {isDark ? <LightModeIcon /> : <DarkModeIcon />}
              <ListItemContent>
                <Typography level="title-sm">{isDark ? "Light Mode" : "Dark Mode"}</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton 
              onClick={handleLogout}
              color="danger"
              variant="soft"
              sx={{ borderRadius: "md", mt: 0.5 }}
            >
              <LogoutIcon />
              <ListItemContent>
                <Typography level="title-sm">Logout</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
        </Box>
      </List>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.body" }}>
      <Box 
        component="header"
        sx={{ 
          position: "sticky",
          top: 0,
          zIndex: 1100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 2, md: 3 },
          py: 1,
          backdropFilter: "blur(20px)", 
          bgcolor: isDark ? "rgba(36, 37, 38, 0.8)" : "rgba(255, 255, 255, 0.8)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            variant="plain"
            color="neutral"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            level="h4"
            fontWeight="900"
            sx={{
              letterSpacing: "-1px",
              color: "primary.solidBg",
              textTransform: "uppercase"
            }}
          >
            MIKARRITO
          </Typography>
        </Box>

        {currentUser && (
          <IconButton
            variant="plain"
            onClick={() => navigate(`/profile/${currentUser.uid}`)}
            sx={{ borderRadius: "0px", p: 0.5 }}
          >
            <Avatar src={currentUser.photoURL} variant="circular" sx={{ border: "2px solid", borderColor: "primary.solidBg" }}>
              {currentUser.displayName?.[0]?.toUpperCase()}
            </Avatar>
          </IconButton>
        )}
      </Box>

      <Drawer 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          content: {
            sx: {
              bgcolor: 'background.surface',
              p: 0,
              borderRadius: 0,
              boxShadow: 'none',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          },
        }}
      >
        {list()}
      </Drawer>

      <Box 
        component="main" 
        sx={{ 
          p: { xs: 1.5, sm: 2, md: 3 }, // Reduced padding on mobile
          maxWidth: 600, // Slightly narrower for a more focused feed
          margin: "0 auto", 
          minHeight: "calc(100vh - 60px)",
          width: "100%", // Ensure it takes full width up to maxWidth
          boxSizing: "border-box"
        }}
      >
        <Outlet />
      </Box>
      <CreatePost />
    </Box>
  );
}
