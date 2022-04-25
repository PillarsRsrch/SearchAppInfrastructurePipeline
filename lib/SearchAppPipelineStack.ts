import { Stack, StackProps } from "aws-cdk-lib";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";

export class SearchAppPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new CodePipeline(this, "Pipeline", {
      pipelineName: "SearchApp",
      synth: new ShellStep("Synthesis", {
        input: CodePipelineSource.gitHub(
          "PillarsRsrch/SearchAppPipeline",
          "main"
        ),
        commands: ["npm ci", "npm run build", "npm run synth"],
      }),
    });
  }
}
