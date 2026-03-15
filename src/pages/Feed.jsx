import { useEffect, useState } from "react";
import { Typography, Box, CircularProgress, Container } from "@mui/joy";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import PostCard from "../components/PostCard";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData = [];
      querySnapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() });
      });
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Box sx={{ mt: 1 }}>
      <Typography level="h4" fontWeight="900" sx={{ mb: 2, px: 0.5 }}>
        Feed
      </Typography>
      
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress size="md" />
          </Box>
        ) : posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <Typography textAlign="center" textColor="text.secondary" sx={{ py: 4 }}>
            No posts yet. Be the first to post!
          </Typography>
        )}
      </Box>
    </Box>
  );
}
