import { Config, Api as ApiGateway, StackContext, Auth, NextjsSite, Table } from "sst/constructs";

export function Stack({ stack }: StackContext) {

  const STRAVA_CLIENT_ID = new Config.Secret(stack, "STRAVA_CLIENT_ID");
  const STRAVA_CLIENT_SECRET = new Config.Secret(stack, "STRAVA_CLIENT_SECRET");
  const STRAVA_VERIFY_TOKEN = new Config.Secret(stack, "STRAVA_VERIFY_TOKEN");

  const GOOGLE_CLIENT_ID = new Config.Secret(stack, "GOOGLE_CLIENT_ID");
  const GOOGLE_CLIENT_SECRET = new Config.Secret(stack, "GOOGLE_CLIENT_SECRET");

  const table = new Table(stack, "users", {
    fields: {
      userId: "string",
    },
    primaryIndex: { partitionKey: "userId" },
  });

  const api = new ApiGateway(stack, "api", {
    defaults: {
      function: {
        bind: [table],
      },
    },
    routes: {
      "GET /api/strava/webhook": {
        function: {
          handler: "packages/functions/src/strava/index.webhookValidationHandler",
          bind: [STRAVA_VERIFY_TOKEN]
        }
      },
      "GET /api/strava/exchange_token":  {
        function: {
          handler: "packages/functions/src/strava/index.tokenExchangeHandler",
          bind: [STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET]
        }
      },
      "POST /api/strava/webhook": "packages/functions/src/strava/index.webhookHandler",
      "GET /api/google/events": "packages/functions/src/google/index.getEventsHandler",
      "GET /api/user": "packages/functions/src/user/index.getUserHandler",
    },
  });

  const site = new NextjsSite(stack, "Site", {
    path: "packages/web",
    environment: {
      NEXT_PUBLIC_STRACAL_API_URL: api.url,
    },
  });

  const auth = new Auth(stack, "auth", {
    authenticator: {
      handler: "packages/functions/src/auth/index.handler",
      bind: [GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, site],
    },
  });

  auth.attach(stack, {
    api,
    prefix: "/auth",
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
    SiteUrl: site.url,
  });

}
