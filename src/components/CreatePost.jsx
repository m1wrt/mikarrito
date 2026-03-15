import { useState } from "react";
import { 
  Box, 
  Textarea, 
  Button, 
  Avatar, 
  Modal, 
  ModalDialog,
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  IconButton, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton,
  ListItemContent,
  ListItemDecorator,
  CircularProgress,
  Stack,
  Divider,
  Menu,
  MenuButton,
  MenuItem,
  Dropdown
} from "@mui/joy";
import AddIcon from "@mui/icons-material/Add";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import ImageIcon from "@mui/icons-material/Image";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function CreatePost() {
  const [openDialog, setOpenDialog] = useState(false);
  const [mode, setMode] = useState("text"); // "text" | "song"
  
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  
  const { currentUser } = useAuth();

  const handleOpenDialog = (selectedMode) => {
    setMode(selectedMode);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setContent("");
    setSearchQuery("");
    setSearchResults([]);
    setSelectedSong(null);
    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...filesArray].slice(0, 4));
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 4));
    }
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSearchSong = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&entity=song&limit=5`);
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !selectedSong && imageFiles.length === 0) return;

    try {
      setLoading(true);
      let uploadedImageUrls = [];

      if (imageFiles.length > 0) {
        toast.info(`Uploading images...`, { toastId: "uploading" });
        const apiKey = "7ccb46ed2fb622eb3f6be2a7e55b617e"; 
        const uploadPromises = imageFiles.map(async (file) => {
          const formData = new FormData();
          formData.append("image", file);
          const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          return data.data.url;
        });
        uploadedImageUrls = await Promise.all(uploadPromises);
      }
      
      const postData = {
        content: content.trim(),
        userId: currentUser.uid,
        userName: currentUser.displayName || "Anonymous",
        userPhoto: currentUser.photoURL || null,
        userPhone: currentUser.phoneNumber || null,
        createdAt: serverTimestamp(),
        imageUrls: uploadedImageUrls.length > 0 ? uploadedImageUrls : null,
      };

      if (mode === "song" && selectedSong) {
        postData.song = {
          trackName: selectedSong.trackName,
          artistName: selectedSong.artistName,
          artworkUrl: selectedSong.artworkUrl100,
          trackViewUrl: selectedSong.trackViewUrl // Store the link
        };
      }

      await addDoc(collection(db, "posts"), postData);
      if (imageFiles.length > 0) toast.update("uploading", { render: "Posted!", type: "success", isLoading: false, autoClose: 3000 });
      handleCloseDialog();
    } catch (error) {
      toast.dismiss("uploading");
      toast.error("Error creating post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
        <Dropdown>
          <MenuButton
            slots={{ root: IconButton }}
            slotProps={{ root: { variant: "solid", color: "primary", sx: { borderRadius: "50%", width: 56, height: 56, boxShadow: "lg" } } }}
          >
            <AddIcon />
          </MenuButton>
          <Menu placement="top-end" sx={{ mb: 1, borderRadius: "md" }}>
            <MenuItem onClick={() => handleOpenDialog("text")}>
              <ListItemDecorator><AddIcon /></ListItemDecorator>
              Standard Post
            </MenuItem>
            <MenuItem onClick={() => handleOpenDialog("song")}>
              <ListItemDecorator><MusicNoteIcon /></ListItemDecorator>
              Share a Song
            </MenuItem>
          </Menu>
        </Dropdown>
      </Box>

      <Modal open={openDialog} onClose={handleCloseDialog}>
        <ModalDialog sx={{ width: "100%", maxWidth: 500, p: 0 }}>
          <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography level="title-lg">{mode === "song" ? "Post a Song" : "New Post"}</Typography>
            <IconButton variant="plain" color="neutral" onClick={handleCloseDialog}><CloseIcon /></IconButton>
          </Box>
          <Divider />
          <DialogContent sx={{ p: 2, maxHeight: "70vh", overflow: "auto" }}>
            <Stack spacing={2}>
              {mode === "song" && !selectedSong && (
                <Box>
                  <Typography level="title-sm" sx={{ mb: 1 }}>Search Music</Typography>
                  <Stack direction="row" spacing={1}>
                    <Textarea 
                      placeholder="E.g. Bohemian Rhapsody"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearchSong()}
                      sx={{ flexGrow: 1 }}
                    />
                    <Button variant="solid" onClick={handleSearchSong} loading={searching}>
                      <SearchIcon />
                    </Button>
                  </Stack>
                  {searchResults.length > 0 && (
                    <List sx={{ mt: 1, bgcolor: "background.level1", borderRadius: "0px", maxHeight: 200, overflow: "auto" }}>
                      {searchResults.map((result) => (
                        <ListItem key={result.trackId}>
                          <ListItemButton onClick={() => setSelectedSong(result)}>
                            <ListItemDecorator>
                              <Avatar src={result.artworkUrl60} variant="rounded" sx={{ borderRadius: "md" }} />
                            </ListItemDecorator>
                            <ListItemContent>
                              <Typography level="title-sm">{result.trackName}</Typography>
                              <Typography level="body-xs">{result.artistName}</Typography>
                            </ListItemContent>
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              )}

              {mode === "song" && selectedSong && (
                <Box sx={{ p: 1.5, bgcolor: "background.level1", borderRadius: "lg", display: "flex", gap: 1.5, alignItems: "center" }}>
                  <Avatar src={selectedSong.artworkUrl100} variant="rounded" sx={{ width: 60, height: 60, borderRadius: "md" }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography level="title-sm">{selectedSong.trackName}</Typography>
                    <Typography level="body-xs">{selectedSong.artistName}</Typography>
                  </Box>
                  <IconButton variant="plain" size="sm" onClick={() => setSelectedSong(null)}><CloseIcon /></IconButton>
                </Box>
              )}

              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Avatar src={currentUser?.photoURL} variant="circular" />
                <Box sx={{ flexGrow: 1 }}>
                  <Textarea
                    minRows={3}
                    maxRows={6}
                    placeholder={mode === "song" ? "Add a comment..." : "What's happening?"}
                    variant="plain"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    sx={{ p: 0, bgcolor: "transparent", "&:focus-within": { outline: "none" }, fontSize: "lg" }}
                  />
                </Box>
              </Stack>

              {imagePreviews.length > 0 && (
                <Box sx={{ display: "grid", gridTemplateColumns: imagePreviews.length > 1 ? "1fr 1fr" : "1fr", gap: 1 }}>
                  {imagePreviews.map((preview, index) => (
                    <Box key={index} sx={{ position: "relative", borderRadius: "lg", overflow: "hidden" }}>
                      <img src={preview} alt="preview" style={{ width: "100%", height: 180, objectFit: "cover" }} />
                      <IconButton 
                        variant="solid" color="neutral" size="sm" 
                        onClick={() => removeImage(index)}
                        sx={{ position: "absolute", top: 8, right: 8, opacity: 0.8, borderRadius: "md" }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}

              <Stack direction="row" justifyContent="space-between">
                <IconButton component="label" variant="soft" color="neutral" disabled={imageFiles.length >= 4}>
                  <ImageIcon />
                  <input type="file" hidden multiple accept="image/*" onChange={handleImageChange} />
                </IconButton>
              </Stack>
            </Stack>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={handleSubmit} 
              loading={loading}
              disabled={(!content.trim() && !selectedSong && imageFiles.length === 0) || (mode === "song" && !selectedSong)}
              sx={{ borderRadius: "xl", px: 4 }}
            >
              Post
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </>
  );
}
