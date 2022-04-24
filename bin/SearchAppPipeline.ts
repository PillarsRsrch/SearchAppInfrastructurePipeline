#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { SearchAppPipelineStack } from "../lib/SearchAppPipelineStack";

const app = new cdk.App();
new SearchAppPipelineStack(app, "SearchAppPipelineStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
