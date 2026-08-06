import { AuthConfig } from "convex/server";

import { requireEnvVar } from "../lib/utils";

export default {
  providers: [
    {
      // Replace with your Clerk Frontend API URL
      // or with `requireEnvVar("CLERK_JWT_ISSUER_DOMAIN")`
      // and configure CLERK_JWT_ISSUER_DOMAIN on the Convex Dashboard
      // See https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances
      domain: requireEnvVar("CLERK_JWT_ISSUER_DOMAIN"),
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
