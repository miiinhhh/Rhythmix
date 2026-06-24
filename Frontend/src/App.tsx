import {
  createBrowserRouter,
  RouterProvider,
  useNavigate,
} from "react-router-dom";
import AppLayout from "./layouts/AppLayout";

import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import LibraryPage from "./pages/LibraryPage";
import ShareInboxPage from "./pages/ShareInboxPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import PlaylistDetailPage from "./pages/PlaylistDetailPage";
import AlbumDetailPage from "./pages/AlbumDetailPage";
import LikedSongsPage from "./pages/LikedSongsPage";
import { NotificationProvider } from "./context/NotificationContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LoadingProvider } from "./context/LoadingContext";
import AuthModal from "./components/AuthModal";

type AuthMode = "login" | "register";

const AuthRoute = ({ initialMode }: { initialMode: AuthMode }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black">
      <AuthModal
        open={true}
        initialMode={initialMode}
        onClose={() => navigate("/")}
        onAuthenticated={() => navigate("/home")}
      />
    </div>
  );
};

// Tạo bộ định tuyến cấu hình đường dẫn URL
const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <AuthRoute initialMode="login" />,
  },
  {
    path: "/signup",
    element: <AuthRoute initialMode="register" />,
  },
  {
    element: <AppLayout />,
    children: [
      { path: "/home", element: <HomePage /> },
      { path: "/search", element: <SearchPage /> },
      { path: "/library", element: <LibraryPage /> },
      { path: "/inbox", element: <ShareInboxPage /> },
      { path: "/notifications", element: <NotificationsPage /> },
      { path: "/profile", element: <ProfilePage /> },
      { path: "/playlist/:id", element: <PlaylistDetailPage /> },
      { path: "/album/:id", element: <AlbumDetailPage /> },
      { path: "/liked", element: <LikedSongsPage /> },
      { path: "/profile/:userId", element: <ProfilePage /> },
    ],
  },
]);

const App = () => {
  return (
    <ThemeProvider>
      <LoadingProvider>
        <NotificationProvider>
          <RouterProvider router={router} />
        </NotificationProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
};

export default App;
