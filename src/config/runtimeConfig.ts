import { z } from "zod";

export const RuntimeConfigSchema = z.object({
  VITE_APP_CONFIG_PATH: z.string().optional(),

  VITE_APP_REST_API_URL: z.string().min(1),
  VITE_APP_WS_API_URL: z.string().min(1),
  VITE_APP_GRAPHQL_API_URL: z.string().min(1),
  VITE_APP_GRAPHQL_WS_URL: z.string().min(1),
  VITE_APP_GRAPHQL_WSS: z.boolean().optional(),

  VITE_APP_ENABLE_AUTH0: z.boolean().optional(),
  VITE_APP_AUTH0_DOMAIN: z.string().optional(),
  VITE_APP_AUTH0_CLIENT_ID: z.string().optional(),
  VITE_APP_AUTH0_AUDIENCE: z.string().optional(),
});

export type RuntimeConfig = z.infer<typeof RuntimeConfigSchema>;
