import Discord from "discord.js";
import logger from "./logger";
import * as clockify from "./clockify";
import { readState, saveState } from "./persist";
import { ClockifyProjects, DiscordVoiceChannels } from "./config";

const client = new Discord.Client();
let state = readState();

client.on("ready", () => {
  logger.info(`Logged in as ${client.user!.tag}!`);
});

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
    const tokenValid = await clockify.tokenValid(token);

    if (tokenValid) {
      // Save to database
      state = saveState({
        ...state,
        clockifyTokens: { ...state.clockifyTokens, [discordUser.id]: token },
      });
      msg.channel.send("Successfully logged into Clockify.");
    } else {
      msg.channel.send("Invalid token; please try again.");
    }
  }
});

function voiceChannelToProject(
  channelId: DiscordVoiceChannels
): ClockifyProjects {
  const map = {
    [DiscordVoiceChannels.APPLICATIONS]: ClockifyProjects.APPLICATIONS,
    [DiscordVoiceChannels.MARKETING]: ClockifyProjects.MARKETING,
    [DiscordVoiceChannels.OPERATIONS]: ClockifyProjects.OPERATIONS,
    [DiscordVoiceChannels.TECH]: ClockifyProjects.TECH,
  };
  const projectId = map[channelId];
  logger.debug(`Converted channel id ${channelId} to ${projectId}`);
  return map[channelId];
}

client.on("voiceStateUpdate", async (oldMember, newMember) => {
  const newUserChannel = newMember.channelID;
  const oldUserChannel = oldMember.channelID;

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
      await clockify.startTimeTracking(
        state.clockifyTokens[newMember.id],
        voiceChannelToProject(newUserChannel as DiscordVoiceChannels)
      );
    } catch (e) {
      newMember.member?.send(e.toString());
    }
  }
});

logger.info("hi!");

client.login(process.env.TOKEN);
