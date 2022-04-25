#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { SearchAppPipelineInfrastructureStack } from "../lib/SearchAppInfrastructurePipelineStack";

const app = new cdk.App();
new SearchAppPipelineInfrastructureStack(app, "SearchAppPipelineStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
