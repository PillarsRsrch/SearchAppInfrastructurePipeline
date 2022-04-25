import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ECS from "aws-cdk-lib/aws-ecs";
import * as ECSPatterns from "aws-cdk-lib/aws-ecs-patterns";
import * as ECR from "aws-cdk-lib/aws-ecr";
import * as Route53 from "aws-cdk-lib/aws-route53";
import * as ELB from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as ACM from "aws-cdk-lib/aws-certificatemanager";
import * as Route53Targets from "aws-cdk-lib/aws-route53-targets";

export class SearchAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const domainName = "pillars-research.com";
    const hostedZone = new Route53.HostedZone(
      this,
      "SearchAppPublicHostedZone",
      {
        zoneName: domainName,
      }
    );

    const fargateService =
      new ECSPatterns.ApplicationLoadBalancedFargateService(
        this,
        `Fargate-Service-${id}`,
        {
          serviceName: "SearchAppFrontend",
          taskImageOptions: {
            image: ECS.ContainerImage.fromEcrRepository(
              ECR.Repository.fromRepositoryName(
                this,
                "pillars-app",
                "pillars-app"
              )
            ),
            containerPort: 3000,
          },
          protocol: ELB.ApplicationProtocol.HTTPS,
          certificate: new ACM.Certificate(this, "Certificate", {
            domainName,
            validation: ACM.CertificateValidation.fromDns(hostedZone),
          }),
          redirectHTTP: true,
          domainZone: hostedZone,
          publicLoadBalancer: true,
        }
      );

    new Route53.ARecord(this, "LoadBalancerRecord", {
      zone: hostedZone,
      recordName: domainName,
      target: Route53.RecordTarget.fromAlias(
        new Route53Targets.LoadBalancerTarget(fargateService.loadBalancer)
      ),
    });
  }
}
