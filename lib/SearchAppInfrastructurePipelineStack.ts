import { Stack, StackProps } from "aws-cdk-lib";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";
import { SearchAppInfrastructurePipelineStage } from "./SeachAppInfrastructurePipelineStage";
import * as ECR from "aws-cdk-lib/aws-ecr";

export class SearchAppPipelineInfrastructureStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const pipeline = new CodePipeline(this, "Pipeline", {
      pipelineName: "SearchApp",
      synth: new ShellStep("Synthesis", {
        input: CodePipelineSource.gitHub(
          "PillarsRsrch/SearchAppInfrastructurePipeline",
          "main"
        ),
        additionalInputs: {
          source: CodePipelineSource.ecr(
            ECR.Repository.fromRepositoryName(this, "ECR", "pillars-app")
          ),
        },
        commands: ["npm ci", "npm run build", "npm run synth"],
      }),
    });

    pipeline.addStage(
      new SearchAppInfrastructurePipelineStage(this, "prod", props)
    );
  }
}
