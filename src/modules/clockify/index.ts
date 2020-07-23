import { Client } from "discord.js";
import * as clockify from "./clockify";
import { saveState, readState } from "../../persist";
import logger from "../../logger";

export default function clockifyModule(client: Client) {
  client.on("message", async (msg) => {
    if (msg.channel.type !== "dm") {
      return; // Skip because we only process logins in DMs
    }
    const parts = msg.content.split(" ");
    if (parts[0] === "!login") {
      const discordUser = msg.author;
      const token = parts[1];
      if (token === undefined) {
        msg.channel.send("Please specify a token.");
      }

      logger.info(`Logging in ${discordUser.tag} with token ${token}`);
      try {
        const tokenValid = await clockify.tokenValid(token);

        if (tokenValid) {
          // Save to database
          saveState({
            ...readState(),
            clockifyTokens: {
              ...readState().clockifyTokens,
              [discordUser.id]: token,
            },
          });
          msg.channel.send("Successfully logged into Clockify.");
        } else {
          msg.channel.send("Invalid token; please try again.");
        }
      } catch (e) {
        msg.channel.send(e.toString());
      }
    }
  });

  client.on("voiceStateUpdate", async (oldMember, newMember) => {
    const newUserChannel = newMember.channelID;
    const oldUserChannel = oldMember.channelID;

    const state = readState();

    if (!state.clockifyTokens[newMember.id]) {
      logger.info(`User ${newMember.id} lacks Clockify token setup, skipping`);
      return;
    }

    if (!!oldUserChannel) {
      // User leaves a voice channel
      logger.info(newMember.id + " left " + oldUserChannel);
      try {
        await clockify.stopTimeTracking(state.clockifyTokens[newMember.id]);
      } catch (e) {
        newMember.member?.send(e.toString());
      }
    }
    if (!!newUserChannel) {
      // User joins a voice channel
      logger.info(newMember.id + " joined " + newUserChannel);
      try {
        await clockify.startTimeTracking(state.clockifyTokens[newMember.id]);
      } catch (e) {
        newMember.member?.send(e.toString());
      }
    }
  });
}
