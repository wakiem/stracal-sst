import { SSTConfig } from "sst";
import { Stack } from "./stacks/Api";

export default {
  config(_input) {
    return {
      name: "stracal-sst",
      region: "eu-central-1",
    };
  },
  stacks(app) {
    app.stack(Stack);
  }
} satisfies SSTConfig;
