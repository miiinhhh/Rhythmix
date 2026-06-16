import * as signalR from "@microsoft/signalr";
import { useNotificationStore } from "../store/useNotificationStore";

// Đảm bảo URL này khớp với cổng Backend của bạn đang lắng nghe
const HUB_URL = "http://localhost:5269/notificationHub";

class NotificationHub {
  private connection: signalR.HubConnection;

  constructor() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => localStorage.getItem("token") || "" })
      .withAutomaticReconnect()
      .build();
  }

  public startConnection = async () => {
    // Đăng ký nhận thông báo
    this.connection.on("ReceiveNotification", (data) => {
      useNotificationStore.getState().addNotification(data);
    });

    try {
      await this.connection.start();
      console.log("Notification Hub Connected");
    } catch (err) {
      console.error("Error connecting to Notification Hub:", err);
    }
  };
}

export const notificationHub = new NotificationHub();