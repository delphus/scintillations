import Discord from "discord.js";
import logger from "./logger";
import clockifyModule from "./modules/clockify";
import standupModule from "./modules/standup";

const client = new Discord.Client();

// Initialize all modules
for (const module of [clockifyModule, standupModule]) {
  module(client);
}

client.on("ready", () => {
  logger.info(`Logged in as ${client.user!.tag}!`);
});

logger.info("Started Scintillations bot!");
client.login(process.env.TOKEN);
