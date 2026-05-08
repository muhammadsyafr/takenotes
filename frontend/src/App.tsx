import { useEffect, useState } from "react";
import { useStore } from "./store";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { Layout } from "./components/Layout";
import { Toast } from "./components/Toast";

function App() {
  const { isAuthenticated, isAuthLoading, isDataLoading, checkAuth, theme, selectedNote } = useStore();
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

  if (isAuthLoading || isDataLoading) {
    return (
      <div className="min-h-dvh bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-full max-w-md">
          {currentHash === "#register" ? <Register /> : <Login />}
        </div>
        <Toast />
      </div>
    );
  }

  return (
    <>
      <Layout />
      <Toast />
    </>
  );
}

export default App;
