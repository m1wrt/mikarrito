import { useState, useEffect } from "react";
import { 
  Card, 
  Avatar, 
  Box, 
  IconButton, 
  Typography, 
  Dropdown, 
  Menu, 
  MenuButton, 
  MenuItem,
  Modal,
  ModalClose,
  ModalDialog
} from "@mui/joy";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShareIcon from "@mui/icons-material/Share";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { toast } from "react-toastify";

import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { doc, deleteDoc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function PostCard({ post }) {
  const { content, userName, userPhoto, createdAt, userId, id } = post;
  const likes = post.likes || [];
  const { currentUser } = useAuth();
  
  const hasLiked = currentUser ? likes.includes(currentUser.uid) : false;
  const [likerNames, setLikerNames] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchLikerNames = async () => {
      if (likes.length === 0) {
        setLikerNames([]);
        return;
      }
      try {
        const names = [];
        for (const uid of likes) {
          const userDoc = await getDoc(doc(db, "users", uid));
          if (userDoc.exists()) {
            names.push(userDoc.data().displayName);
          }
        }
        setLikerNames(names);
      } catch (error) {
        console.error("Error fetching liker names:", error);
      }
    };
    fetchLikerNames();
  }, [likes]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteDoc(doc(db, "posts", id));
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const handleLike = async () => {
    if (!currentUser) return;
    try {
      const postRef = doc(db, "posts", id);
      if (hasLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(currentUser.uid)
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(currentUser.uid)
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleShare = async () => {
    const shareText = `${userName} posted: "${content}"\nSee more on our app!`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Post by ${userName}`,
          text: shareText,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success("Post copied to clipboard!", { position: "bottom-center", autoClose: 2000 });
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const timeAgo = createdAt?.toDate 
    ? formatDistanceToNow(createdAt.toDate(), { addSuffix: true }) 
    : "just now";

  return (
    <Card 
      variant="outlined"
      sx={{ 
        mb: 2, 
        borderRadius: 0, 
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.surface",
        gap: 1.5,
      }}
    >
      {/* Header: Avatar, Name, Time and Menu */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Link to={`/profile/${userId}`} style={{ textDecoration: 'none' }}>
            <Avatar 
              src={post.userPhoto} 
              variant="circular"
              sx={{ width: 40, height: 40 }}
            >
              {post.userName?.[0]?.toUpperCase()}
            </Avatar>
          </Link>
          <Box>
            <Link to={`/profile/${userId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography level="title-sm" sx={{ "&:hover": { textDecoration: "underline" }, lineHeight: 1.2 }}>
                {userName || "Anonymous"}
              </Typography>
            </Link>
            <Typography level="body-xs" textColor="text.secondary">
              {timeAgo}
            </Typography>
          </Box>
        </Box>
        
        {currentUser?.uid === userId && (
          <Dropdown>
            <MenuButton
              slots={{ root: IconButton }}
              slotProps={{ root: { variant: "plain", color: "neutral", size: "sm" } }}
            >
              <MoreVertIcon />
            </MenuButton>
            <Menu placement="bottom-end">
              <MenuItem variant="soft" color="danger" onClick={handleDelete}>
                Delete
              </MenuItem>
            </Menu>
          </Dropdown>
        )}
      </Box>

      {/* Body: Content, Images, Song */}
      <Box sx={{ width: "100%" }}>
        {content && (
          <Typography level="body-md" sx={{ mb: 1.5, whiteSpace: "pre-wrap" }}>
            {content}
          </Typography>
        )}

        {(post.imageUrls || post.imageUrl) && (
          <Box sx={{ 
            mx: -0.5, // Slight pull to fill card width better
            mb: 1.5, 
            display: "grid", 
            gridTemplateColumns: (post.imageUrls?.length > 1) ? "1fr 1fr" : "1fr", 
            gap: 0.5,
            borderRadius: "xl", 
            overflow: "hidden" 
          }}>
            {(post.imageUrls || [post.imageUrl]).map((url, index) => (
              <Box 
                key={index}
                onClick={() => setPreviewImage(url)}
                sx={{ cursor: "pointer", overflow: "hidden" }}
              >
                <img 
                  src={url} 
                  alt={`Post attachment ${index}`} 
                  style={{ 
                    width: "100%", 
                    height: (post.imageUrls?.length > 1) ? 180 : "auto",
                    maxHeight: 550, 
                    objectFit: "cover", 
                    display: "block"
                  }} 
                />
              </Box>
            ))}
          </Box>
        )}

        {post.song && (
          <Box 
            component="a"
            href={post.song.trackViewUrl || `https://open.spotify.com/search/${encodeURIComponent(post.song.trackName + " " + post.song.artistName)}`}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ 
              mb: 1.5, 
              display: "flex", 
              gap: 2, 
              alignItems: "center", 
              borderRadius: "xl", 
              p: 2,
              position: "relative",
              overflow: "hidden",
              textDecoration: "none",
              "&:hover": {
                "& .play-icon": { opacity: 1 }
              }
            }}
          >
            {/* Blurred Background Image */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${post.song.artworkUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(25px) brightness(0.6)",
                transform: "scale(1.2)",
                zIndex: 0,
              }}
            />
            
            {/* Content Overlay */}
            <Avatar 
              src={post.song.artworkUrl} 
              variant="rounded" 
              sx={{ 
                width: 56, 
                height: 56, 
                zIndex: 1, 
                boxShadow: "lg",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "lg"
              }} 
            />
            <Box sx={{ flexGrow: 1, zIndex: 1, minWidth: 0 }}>
              <Typography level="title-md" textColor="#fff" fontWeight="bold" noWrap>
                {post.song.trackName}
              </Typography>
              <Typography level="body-sm" sx={{ color: "rgba(255,255,255,0.7)" }} noWrap>
                {post.song.artistName}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                <Typography level="body-xs" sx={{ color: "#1DB954", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Spotify
                </Typography>
              </Box>
            </Box>
            
            <IconButton
              className="play-icon"
              variant="solid"
              color="success"
              size="sm"
              sx={{ 
                zIndex: 1, 
                borderRadius: "50%", 
                bgcolor: "#1DB954", 
                color: "#000",
                opacity: 0,
                boxShadow: "xl",
                transition: "opacity 0.2s",
                "&:hover": { bgcolor: "#1ed760" }
              }}
            >
              <PlayArrowIcon />
            </IconButton>
          </Box>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Box sx={{ display: "flex", gap: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton 
                variant="plain"
                color={hasLiked ? "danger" : "neutral"}
                size="sm"
                onClick={handleLike}
                sx={{ p: 0, mr: 0.5 }}
              >
                {hasLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              <Typography level="body-xs" textColor={hasLiked ? "danger.plainColor" : "text.secondary"} sx={{ fontWeight: hasLiked ? "bold" : "normal" }}>
                {likes.length > 0 ? likes.length : ""}
              </Typography>
            </Box>
            <IconButton 
              variant="plain" 
              color="neutral" 
              size="sm"
              onClick={handleShare}
              sx={{ p: 0 }}
            >
              <ShareIcon fontSize="small" />
            </IconButton>
          </Box>
          
          {likerNames.length > 0 && (
            <Typography level="body-xs" textColor="text.tertiary" sx={{ fontSize: "0.7rem" }}>
              Liked by {likerNames.join(", ")}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Image Preview Modal */}
      <Modal open={!!previewImage} onClose={() => setPreviewImage(null)}>
        <ModalDialog 
          layout="fullscreen" 
          sx={{ 
            bgcolor: "rgba(0,0,0,0.9)", 
            p: 0, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            border: "none"
          }}
        >
          <ModalClose sx={{ position: "fixed", top: 16, right: 16, color: "white", bgcolor: "rgba(255,255,255,0.1)", borderRadius: 0, "&:hover": { bgcolor: "rgba(255,255,255,0.2)" } }} />
          <img 
            src={previewImage} 
            alt="Preview" 
            style={{ 
              maxWidth: "100%", 
              maxHeight: "100%", 
              objectFit: "contain" 
            }} 
          />
        </ModalDialog>
      </Modal>
    </Card>
  );
}
