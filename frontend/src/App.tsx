import { useEffect, useState } from "react";
import { useStore } from "./store";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { Layout } from "./components/Layout";

function App() {
  const { isAuthenticated, checkAuth, theme } = useStore();
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-full max-w-md">
          {currentHash === "#register" ? <Register /> : <Login />}
        </div>
      </div>
    );
  }

  return <Layout />;
}

export default App;
