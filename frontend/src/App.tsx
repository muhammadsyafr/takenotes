import { useEffect, useState } from "react";
import { useStore } from "./store";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { Layout } from "./components/Layout";

function App() {
  const { isAuthenticated, authReady, checkAuth, theme, selectedNote } = useStore();
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    if (selectedNote) {
      const title = (selectedNote.text.split("\n")[0] || "").replace(/^#+\s*/, "");
      document.title = title ? `${title} - TakeNote` : "TakeNote";
    } else {
      document.title = "TakeNote";
    }
  }, [selectedNote]);

  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (!authReady) {
    return null;
  }

  if (!isAuthenticated) {
    return currentHash === "#register" ? <Register /> : <Login />;
  }

  return <Layout />;
}

export default App;
