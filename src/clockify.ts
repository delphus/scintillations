import fetch from "cross-fetch";
import logger from "./logger";
import { ClockifyProjects, CLOCKIFY_WORKSPACE } from "./config";

async function api(endpoint: string, token: string, method: string, body?: {}) {
  return await fetch("https://api.clockify.me/api/v1" + endpoint, {
    headers: {
      "X-Api-Key": token,
      "Content-Type": "application/json",
    },
    method: method,
    body: JSON.stringify(body),
  });
}

export async function tokenValid(token: string) {
  logger.info("Testing clockify token");
  const res = await api("/user", token, "GET");
  if (res.status === 200) {
    return true;
  } else if (res.status === 401) {
    return false;
  } else {
    throw new Error("Failed to verify token - " + res.status);
  }
}

export async function startTimeTracking(
  token: string,
  projectId: ClockifyProjects
) {
  const res = await api(
    `/workspaces/${CLOCKIFY_WORKSPACE}/time-entries`,
    token,
    "POST",
    {
      start: new Date().toISOString(),
      billable: true,
      projectId,
    }
  );
  if (!res.ok) {
    throw new Error("Failed to start time tracking - " + res.status);
  }
}

export async function stopTimeTracking(token: string) {
  const userId: string = await api("/user", token, "GET")
    .then((r) => r.json())
    .then((j) => j.id);
  await api(
    `/workspaces/${CLOCKIFY_WORKSPACE}/user/${userId}/time-entries`,
    token,
    "PATCH",
    {
      end: new Date().toISOString(),
    }
  ).then((r) => r.json());
}
