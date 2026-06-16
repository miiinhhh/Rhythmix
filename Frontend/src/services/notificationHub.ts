<<<<<<< HEAD
import * as signalR from "@microsoft/signalr";
import { useNotificationStore } from "../store/useNotificationStore";

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
    this.connection.on("ReceiveNotification", (data) => {
      useNotificationStore.getState().addNotification(data);
    });
    await this.connection.start();
  };
}

=======
import * as signalR from "@microsoft/signalr";
import { useNotificationStore } from "../store/useNotificationStore";

const HUB_URL = "http://localhost:5000/notificationHub";

class NotificationHub {
  private connection: signalR.HubConnection;

  constructor() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => localStorage.getItem("token") || "" })
      .withAutomaticReconnect()
      .build();
  }

  public startConnection = async () => {
    this.connection.on("ReceiveNotification", (data) => {
      useNotificationStore.getState().addNotification(data);
    });
    await this.connection.start();
  };
}

>>>>>>> 74fd9038b4822c2d3d861cf9845199c9494fdece
export const notificationHub = new NotificationHub();