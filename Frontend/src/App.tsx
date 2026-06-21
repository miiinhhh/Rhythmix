import {
  createBrowserRouter,
  RouterProvider,
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

// Tạo bộ định tuyến cấu hình đường dẫn URL
const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
        // Dùng AppLayout làm khung bao bọc tất cả các trang
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
