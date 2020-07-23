import { Client, TextChannel } from "discord.js";
import { CronJob } from "cron";
import { STANDUP_CHANNEL } from "../config";

export default function standupModule(client: Client) {
  new CronJob(
    "0 22 * * 1-5",
    async () => {
      const updatesChannel = client.channels.resolve(
        STANDUP_CHANNEL
      ) as TextChannel;

      await updatesChannel.send(
        `@everyone Welcome to auto-standup-bot! Here you can write a short daily update.

(1) What did you accomplish today?
(2) What are you planning to work on?
(3) Is anything standing in your way?

Thanks!`
      );
    },
    null,
    true,
    "America/New_York"
  ).start();
}
