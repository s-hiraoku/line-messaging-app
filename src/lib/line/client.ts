import { Client, type ClientConfig, type Message } from "@line/bot-sdk";
import { prisma } from "@/lib/prisma";

type Cached = { token: string; expiresAt: number } | null;
let cached: Cached = null;

async function issueAccessToken(channelId: string, channelSecret: string): Promise<{ token: string; expiresIn: number }> {
  const params = new URLSearchParams();
  params.set("grant_type", "client_credentials");
  params.set("client_id", channelId);
  params.set("client_secret", channelSecret);

  const res = await fetch("https://api.line.me/v2/oauth/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!res.ok) {
    throw new Error("Failed to issue channel access token");
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  return { token: data.access_token, expiresIn: data.expires_in };
}

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cached && cached.expiresAt - 60_000 > now) return cached.token; // 60s early refresh window

  const conf = await prisma.channelConfig.findUnique({ where: { id: "primary" } });
  const channelId = conf?.channelId;
  const channelSecret = conf?.channelSecret;
  if (!channelId || !channelSecret) throw new Error("チャネルID/シークレットが未設定です。設定画面で登録してください。");

  const { token, expiresIn } = await issueAccessToken(channelId, channelSecret);
  cached = { token, expiresAt: now + expiresIn * 1000 };
  return token;
}

async function createClient(): Promise<Client> {
  const channelSecretConf = await prisma.channelConfig.findUnique({ where: { id: "primary" } });
  const channelSecret = channelSecretConf?.channelSecret ?? undefined;
  if (!channelSecret) throw new Error("チャネルシークレットが未設定です。");

  const accessToken = await getAccessToken();
  const config: ClientConfig = {
    channelAccessToken: accessToken,
    channelSecret,
  };
  return new Client(config);
}

export async function getLineClient(): Promise<Client> {
  return createClient();
}

export async function pushMessage(to: string, messages: Message | Message[]): Promise<void> {
  const client = await getLineClient();
  await client.pushMessage(to, messages);
}

export async function broadcastMessage(messages: Message | Message[]): Promise<void> {
  const client = await getLineClient();
  await client.broadcast(messages);
}
