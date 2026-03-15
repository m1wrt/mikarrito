import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  Container, 
  Box, 
  Typography, 
  Textarea, 
  Button, 
  CircularProgress, 
  Avatar, 
  Modal, 
  ModalDialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  IconButton,
  Stack,
  Divider
} from "@mui/joy";
import SettingsIcon from "@mui/icons-material/Settings";
import ImageIcon from "@mui/icons-material/Image";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { toast } from "react-toastify";
import { useColorMode } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import PostCard from "../components/PostCard";

export default function Profile() {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const { mode, toggleColorMode } = useColorMode();
  const isDark = mode === "dark";
  
  const [bio, setBio] = useState("");
  const [profileName, setProfileName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editPhotoURL, setEditPhotoURL] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [posts, setPosts] = useState([]);

  const isOwnProfile = currentUser?.uid === userId;

  useEffect(() => {
    if (!userId) return;
    
    // Fetch profile data in real-time
    const profileDocRef = doc(db, "users", userId);
    const unsubscribeProfile = onSnapshot(profileDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBio(data.bio || "");
        setProfileName(data.displayName || "");
        setPhotoURL(data.photoURL || "");
      }
    }, (error) => {
      console.error("Error fetching profile real-time", error);
    });

    const q = query(
      collection(db, "posts"),
      where("userId", "==", userId)
    );
    
    const unsubscribePosts = onSnapshot(q, (querySnapshot) => {
      const postsData = [];
      querySnapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() });
      });
      postsData.sort((a,b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setPosts(postsData);
      
      if (!profileName && postsData.length > 0) {
        setProfileName(postsData[0].userName);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeProfile();
      unsubscribePosts();
    };
  }, [userId, profileName]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    let finalPhotoURL = editPhotoURL;

    try {
      if (imageFile) {
        toast.info("Uploading photo...", { toastId: "uploading_profile" });
        const formData = new FormData();
        formData.append("image", imageFile);
        const apiKey = "7ccb46ed2fb622eb3f6be2a7e55b617e"; 
        
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        
        if (data.success && data.data && data.data.url) {
          finalPhotoURL = data.data.url;
        } else {
          throw new Error("Failed to upload image.");
        }
      }

      const docRef = doc(db, "users", currentUser.uid);
      await setDoc(docRef, { 
        bio: editBio,
        displayName: currentUser.displayName || "Unknown User",
        photoURL: finalPhotoURL
      }, { merge: true });

      await updateProfile(currentUser, { photoURL: finalPhotoURL });

      setBio(editBio);
      setProfileName(currentUser.displayName);
      setPhotoURL(finalPhotoURL);
      setOpenDialog(false);

      if (imageFile) toast.update("uploading_profile", { render: "Profile saved!", type: "success", isLoading: false, autoClose: 3000 });
      else toast.success("Profile saved!");

    } catch (error) {
      if (imageFile) toast.dismiss("uploading_profile");
      toast.error("Error saving profile");
      console.error("Error saving profile", error);
    } finally {
      setSaving(false);
    }
  };

  const openSettings = () => {
    setEditBio(bio);
    setEditPhotoURL(photoURL);
    setImageFile(null);
    setImagePreview(null);
    setOpenDialog(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress size="lg" />
      </Box>
    );
  }

  const displayName = profileName || (isOwnProfile ? currentUser?.displayName : "Unknown User");

  return (
    <Box sx={{ mt: 1 }}>
      <Stack spacing={3}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", px: 0.5 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={photoURL} variant="circular" sx={{ "--Avatar-size": "80px" }}>
              {!photoURL && (displayName?.[0]?.toUpperCase() || "A")}
            </Avatar>
            <Box>
              <Typography level="h4" fontWeight="900">
                {displayName}
              </Typography>
              <Typography level="body-md" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>
                {bio || "No description provided yet."}
              </Typography>
            </Box>
          </Stack>
          
          {isOwnProfile && (
            <IconButton variant="outlined" color="neutral" onClick={openSettings}>
              <SettingsIcon />
            </IconButton>
          )}
        </Box>

        <Divider />
        <Typography level="title-lg" fontWeight="bold">Posts</Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <Typography textAlign="center" textColor="text.secondary" sx={{ py: 4 }}>
              This user hasn't posted anything yet.
            </Typography>
          )}
        </Box>
      </Stack>

      {/* Settings Modal */}
      <Modal open={openDialog} onClose={() => setOpenDialog(false)}>
        <ModalDialog sx={{ width: "100%", maxWidth: 450, borderRadius: 0 }}>
          <DialogTitle>Edit Profile</DialogTitle>
          <Divider />
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <Avatar src={imagePreview || editPhotoURL} variant="circular" sx={{ "--Avatar-size": "100px" }} />
                <Button component="label" variant="soft" color="neutral" startDecorator={<ImageIcon />}>
                  Change Photo
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </Button>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography level="title-sm">Theme Appearance</Typography>
                <IconButton 
                  variant="soft" 
                  color="primary" 
                  onClick={() => {
                    toggleColorMode();
                  }}
                >
                  {isDark ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Box>
              
              <Box>
                <Typography level="title-sm" sx={{ mb: 1 }}>Bio</Typography>
                <Textarea
                  minRows={3}
                  maxRows={5}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  sx={{ borderRadius: 0 }}
                />
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button variant="solid" color="primary" onClick={handleSave} loading={saving}>
              Save Changes
            </Button>
            <Button variant="plain" color="neutral" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Box>
  );
}
