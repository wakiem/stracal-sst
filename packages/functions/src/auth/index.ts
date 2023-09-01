import { AuthHandler, GoogleAdapter, Session } from "sst/node/auth";
import { Config } from "sst/node/config";
import { Table } from "sst/node/table";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

declare module "sst/node/auth" {
  export interface SessionTypes {
    user: {
      userId: string;
    };
  }
}

export const handler = AuthHandler({
  providers: {
    google: GoogleAdapter({
      mode: "oauth",
      clientID: Config.GOOGLE_CLIENT_ID,
      clientSecret: Config.GOOGLE_CLIENT_SECRET,
      scope: "openid https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.profile",
      onSuccess: async (tokenset) => {
        const claims = tokenset.claims();
        const ddb = new DynamoDBClient({});
        await ddb.send(new PutItemCommand({
          TableName: Table.users.tableName,
          Item: marshall({
            userId: claims.sub,
            givenName: claims.given_name,
            familyName: claims.family_name,
            picture: claims.picture
          }),
        }));
        // Redirects to http://localhost:3000?token=xxx
        return Session.parameter({
          redirect: "http://localhost:3000",
          type: "user",
          properties: {
            userId: claims.sub,
          },
        })
      }
    }),
  },
});