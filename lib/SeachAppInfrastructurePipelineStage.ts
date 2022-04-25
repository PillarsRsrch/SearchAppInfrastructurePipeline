import { Stage, StageProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { SearchAppStack } from "./SearchAppStack";

export class SearchAppInfrastructurePipelineStage extends Stage {
  constructor(scope: Construct, stageName: string, props?: StageProps) {
    super(scope, stageName, props);

    new SearchAppStack(this, "SearchApp", props);
  }
}
