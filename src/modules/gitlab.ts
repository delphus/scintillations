import { Client } from "discord.js";
import { Gitlab } from "@gitbeaker/node";
import { DELPHUS_PROJECT_ID } from "../config";

if (!process.env.GITLAB_TOKEN) {
  throw new Error("GitLab integration requires specifying a GitLab token.");
}

const api = new Gitlab({
  host: "https://gitlab.scintillating.us",
  token: process.env.GITLAB_TOKEN,
});

export default function gitlabModule(client: Client) {
  client.on("message", async (msg) => {
    const parts = msg.content.split(" ");
    if (parts.length !== 3) {
      return;
    }
    if (parts[0] === "!gitlab") {
      const title = parts[1],
        description = parts[2];

      try {
        const res = (await api.Issues.create(DELPHUS_PROJECT_ID, {
          title,
          description: "Created by Scintillations bot:\n\n" + description,
        })) as any;
        const url = res.web_url;
        msg.channel.send(`Created issue as ${url}`);
      } catch (e) {
        msg.channel.send("Failed to create issue: " + e);
      }
    }
  });
}
