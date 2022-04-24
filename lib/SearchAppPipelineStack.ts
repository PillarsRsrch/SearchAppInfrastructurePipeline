import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as EC2 from "aws-cdk-lib/aws-ec2";
import * as ECS from "aws-cdk-lib/aws-ecs";
import * as ECSPatterns from "aws-cdk-lib/aws-ecs-patterns";
import * as ECR from "aws-cdk-lib/aws-ecr";

export class SearchAppPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = this.createVPC();
    const cluster = this.createECS(vpc);
    const repository = new ECR.Repository(this, "pillars-app", {
      repositoryName: "pillars-app",
    });
    this.createFargateService(repository, cluster);
  }

  private createVPC() {
    return new EC2.Vpc(this, "SearchApp-VPC-production-us-west-2");
  }

  private createECS(vpc: EC2.Vpc) {
    return new ECS.Cluster(this, "SerachApp-ECS-Cluster-production-us-west-2", {
      vpc,
    });
  }

  private createFargateService(
    repository: ECR.Repository,
    cluster: ECS.Cluster
  ) {
    return new ECSPatterns.ApplicationLoadBalancedFargateService(
      this,
      "SearchApp-FargateService-production-us-west-2",
      {
        cluster,
        taskImageOptions: {
          image: ECS.ContainerImage.fromEcrRepository(repository),
        },
      }
    );
  }
}
