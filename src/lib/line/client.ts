import { Client, type ClientConfig, type Message } from "@line/bot-sdk";
import { prisma } from "@/lib/prisma";

async function createClientFromDb(): Promise<Client> {
  const config = await prisma.channelConfig.findUnique({ where: { id: "primary" } });
  const channelAccessToken = config?.channelAccessToken ?? undefined;
  const channelSecret = config?.channelSecret ?? undefined;

  if (!channelAccessToken || !channelSecret) {
    throw new Error("Missing LINE channel credentials in ChannelConfig. Configure them in Settings.");
  }

  const clientConfig: ClientConfig = {
    channelAccessToken,
    channelSecret,
  };

  return new Client(clientConfig);
}

export async function getLineClient(): Promise<Client> {
  return createClientFromDb();
}

export async function pushMessage(to: string, messages: Message | Message[]): Promise<void> {
  const client = await getLineClient();
  await client.pushMessage(to, messages);
}

export async function broadcastMessage(messages: Message | Message[]): Promise<void> {
  const client = await getLineClient();
  await client.broadcast(messages);
}
