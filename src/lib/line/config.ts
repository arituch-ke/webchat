import { z } from "zod";

const lineConfigSchema = z.object({
  channelSecret: z.string().min(1),
  channelAccessToken: z.string().min(1),
});

export type LineConfig = z.infer<typeof lineConfigSchema>;

export function getLineConfig(): LineConfig {
  return lineConfigSchema.parse({
    channelSecret: process.env.LINE_CHANNEL_SECRET,
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  });
}
