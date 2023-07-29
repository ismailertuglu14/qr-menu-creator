import schedule from "node-schedule";
import NotificationModel from "./notification_model";

async function sendMenuViewedNotification() {
  console.log("çalştı");
  schedule.scheduleJob("10 * * * * *", async () => {
    console.log("asdsda");
  });
}

export { sendMenuViewedNotification };
