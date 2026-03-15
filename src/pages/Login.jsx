import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider, appleProvider, db } from "../firebase";
import {
  Container,
  Box,
  Typography,
  Input,
  Button,
  Alert,
  Sheet,
  Divider,
  Stack
} from "@mui/joy";
import AppleIcon from "@mui/icons-material/Apple";
import { collection, query, where, getDocs } from "firebase/firestore";

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      setError("Email or password incorrect.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider) => {
    try {
      setError("");
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      
      // Check if user exists in our DB to respect the 3-user limit/registration flow
      const q = query(collection(db, "users"), where("uid", "==", result.user.uid));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        await auth.signOut();
        throw new Error("User not found. Please register first.");
      }
      
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", bgcolor: "background.body" }}>
      <Container maxWidth="xs">
        <Sheet variant="outlined" sx={{ p: 4, borderRadius: "xl", boxShadow: "lg", display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography level="h1" fontWeight="900" textColor="primary.solidBg" sx={{ textTransform: "uppercase", letterSpacing: "-1px" }}>MIKARRITO</Typography>
            <Typography level="body-sm" textColor="text.secondary">Welcome back</Typography>
          </Box>

          {error && <Alert color="danger" variant="soft" sx={{ borderRadius: "md" }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleEmailLogin}>
            <Stack spacing={2}>
              <Box>
                <Typography level="title-sm" sx={{ mb: 1 }}>Email</Typography>
                <Input required type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ borderRadius: "md" }} />
              </Box>
              <Box>
                <Typography level="title-sm" sx={{ mb: 1 }}>Password</Typography>
                <Input required type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} sx={{ borderRadius: "md" }} />
              </Box>
              <Button type="submit" loading={loading} fullWidth sx={{ mt: 1, borderRadius: "md" }}>Sign In</Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 1 }}>or</Divider>

          <Stack spacing={1.5}>
            <Button variant="outlined" color="neutral" fullWidth startDecorator={<GoogleIcon />} onClick={() => handleSocialSignIn(googleProvider)} sx={{ borderRadius: "md" }}>Continue with Google</Button>
            <Button variant="outlined" color="neutral" fullWidth startDecorator={<AppleIcon />} onClick={() => handleSocialSignIn(appleProvider)} sx={{ borderRadius: "md" }}>Continue with Apple</Button>
          </Stack>

          <Box sx={{ textAlign: "center", mt: 1 }}>
            <Link to="/register" style={{ textDecoration: "none" }}><Typography level="body-sm" color="primary" fontWeight="bold">New here? Create an account</Typography></Link>
          </Box>
        </Sheet>
      </Container>
    </Box>
  );
}
