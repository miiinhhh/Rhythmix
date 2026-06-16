import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";

import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import LibraryPage from "./pages/LibraryPage";
import ShareInboxPage from "./pages/ShareInboxPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import PlaylistDetailPage from "./pages/PlaylistDetailPage";
import LikedSongsPage from "./pages/LikedSongsPage";
import { NotificationProvider } from "./context/NotificationContext";
<<<<<<< HEAD
import { ThemeProvider } from "./context/ThemeContext";
import { LoadingProvider } from "./context/LoadingContext";
=======
>>>>>>> 74fd9038b4822c2d3d861cf9845199c9494fdece

// Tạo bộ định tuyến cấu hình đường dẫn URL
const router = createBrowserRouter([
  {
    // Dùng AppLayout làm khung bao bọc tất cả các trang
    element: <AppLayout />,
    children: [
      { path: "/", element: <Navigate to="/home" replace /> }, 
      { path: "/home", element: <HomePage /> },
      { path: "/search", element: <SearchPage /> },
      { path: "/library", element: <LibraryPage /> },
      { path: "/inbox", element: <ShareInboxPage /> },
      { path: "/notifications", element: <NotificationsPage /> },
      { path: "/profile", element: <ProfilePage /> },
      { path: "/playlist/:id", element: <PlaylistDetailPage /> },
      { path: "/liked", element: <LikedSongsPage /> },
      { path: "/profile/:userId", element: <ProfilePage /> },
    ],
  },
]);

const App = () => {
  return (
<<<<<<< HEAD
    <ThemeProvider>
      <LoadingProvider>
        <NotificationProvider>
          <RouterProvider router={router} />
        </NotificationProvider>
      </LoadingProvider>
    </ThemeProvider>
=======
    <NotificationProvider>
      <RouterProvider router={router} />
    </NotificationProvider>
>>>>>>> 74fd9038b4822c2d3d861cf9845199c9494fdece
  );
};

export default App;