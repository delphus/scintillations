import fs from "fs";
import logger from "./logger";

const STATE_PATH = process.env.STATE_PATH ?? "./data.json";

export interface State {
  clockifyTokens: {
    [discordId: string]: string;
  };
}

export function readState(): State {
  try {
    const state = JSON.parse(fs.readFileSync(STATE_PATH).toString()) as State;
    logger.debug("Read state: " + JSON.stringify(state));
    return state;
  } catch (e) {
    logger.debug("Starting with empty state.");
    return { clockifyTokens: {} };
  }
}

export function saveState(obj: State): State {
  const state = JSON.stringify(obj);
  logger.debug(`Writing state: ${state}`);
  fs.writeFileSync(STATE_PATH, state);
  return obj;
}
