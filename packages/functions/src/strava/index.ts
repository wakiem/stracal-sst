import { ApiHandler } from "sst/node/api";
import { Config } from "sst/node/config";
import got from "got";

import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import { transpileSchema } from '@middy/validator/transpile'
import httpErrorHandler from "@middy/http-error-handler";

import { webhookValidationSchema, tokenExchangeSchema, webhookSchema } from "./schema";

const webhookValidationHandlerBase = ApiHandler(async (event) => {
  const { "hub.mode" : mode, "hub.verify_token" : verify_token, "hub.challenge" : challenge } = event.queryStringParameters || {};
  if (mode && verify_token && mode === "subscribe" && verify_token === Config.STRAVA_VERIFY_TOKEN) {
    return {
      statusCode: 200,
      body: JSON.stringify({ "hub.challenge": challenge }),
    };
  }
  return { statusCode: 403 };
});

export const webhookValidationHandler = middy(webhookValidationHandlerBase)
  .use(
    validator({
      eventSchema: transpileSchema(webhookValidationSchema),
    })
  )
  .use(httpErrorHandler());

const tokenExchangeHandlerBase = ApiHandler(async (event) => {
  const { code } = event.queryStringParameters || {};
  const response = await got.post("https://www.strava.com/oauth/token", {
    searchParams: {
      client_id: Config.STRAVA_CLIENT_ID,
      client_secret: Config.STRAVA_CLIENT_SECRET,
      code: code,
      grant_type: "authorization_code",
    },
  });
  if (response.statusCode == 200) {
    return { statusCode: 200 };
  }
  return { statusCode: 500 };
});

export const tokenExchangeHandler = middy(tokenExchangeHandlerBase)
  .use(
    validator({
      eventSchema: transpileSchema(tokenExchangeSchema),
    })
  )
  .use(httpErrorHandler());

const webhookHandlerBase = ApiHandler(async (event) => {
  const { body } = event;
  return { statusCode: 200 };
});

export const webhookHandler = middy(webhookHandlerBase)
  .use(jsonBodyParser())
  .use(
    validator({
      eventSchema: transpileSchema(webhookSchema),
    })
  )
  .use(httpErrorHandler());