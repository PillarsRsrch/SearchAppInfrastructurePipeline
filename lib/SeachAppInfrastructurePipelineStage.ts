import { Stage, StageProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { SearchAppStack } from "./SearchAppStack";

export class SearchAppInfrastructurePipelineStage extends Stage {
  constructor(scope: Construct, stageName: string, props?: StageProps) {
    super(scope, stageName, props);

    const region = props?.env?.region ? props?.env?.region : "us-west-2";

    new SearchAppStack(this, `${stageName}-${region}`, props);
  }
}
