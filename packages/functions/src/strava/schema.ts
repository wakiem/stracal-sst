import { Type } from "@sinclair/typebox";

export const webhookValidationSchema = Type.Object({
  queryStringParameters: Type.Object({
    "hub.mode": Type.String(),
    "hub.challenge": Type.String(),
    "hub.verify_token": Type.String(),
  }), 
});

export const tokenExchangeSchema = Type.Object({
  queryStringParameters: Type.Object({
    "code": Type.String(),
    "scope": Type.String(),
  }), 
});

export const webhookSchema = Type.Object({
  body: Type.Object({
    object_type: Type.String(),
    object_id: Type.Number(),
    aspect_type: Type.String(),
    updates: Type.Optional(
      Type.Object({
        title: Type.Optional(Type.String()),
        type: Type.Optional(Type.String()),
        private: Type.Optional(Type.Boolean()),
        authorized: Type.Optional(Type.Boolean()),
      })
    ),
    owner_id: Type.Number(),
    subscription_id: Type.Number(),
    event_time: Type.Number(),
  }), 
});