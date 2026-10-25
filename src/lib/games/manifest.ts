import { z } from 'zod';

/** One item of the GameMonetize JSON feed (https://rss.gamemonetize.com/rssfeed.php?format=json ...). */
export const GameMonetizeFeedItemSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  title: z.string().min(1),
  description: z.string().optional().default(''),
  instructions: z.string().optional().default(''),
  url: z.string().url(),
  category: z.string().optional().default('Arcade'),
  tags: z.string().optional().default(''),
  thumb: z.string().url(),
  width: z.union([z.string(), z.number()]).optional(),
  height: z.union([z.string(), z.number()]).optional(),
});

export type GameMonetizeFeedItem = z.infer<typeof GameMonetizeFeedItemSchema>;
