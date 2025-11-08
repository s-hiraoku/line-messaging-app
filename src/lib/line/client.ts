import { Client, type ClientConfig, type Message } from "@line/bot-sdk";

let cachedClient: Client | null = null;

function createClient(): Client {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const channelSecret = process.env.LINE_CHANNEL_SECRET;

  if (!channelAccessToken || !channelSecret) {
    throw new Error("Missing LINE channel credentials. Check environment variables.");
  }

  const config: ClientConfig = {
    channelAccessToken,
    channelSecret,
  };

  return new Client(config);
}

export function getLineClient(): Client {
  if (!cachedClient) {
    cachedClient = createClient();
  }

  return cachedClient;
}

export async function pushMessage(to: string, messages: Message | Message[]): Promise<void> {
  const client = getLineClient();
  await client.pushMessage(to, messages);
}

export async function broadcastMessage(messages: Message | Message[]): Promise<void> {
  const client = getLineClient();
  await client.broadcast(messages);
}
