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
    const hostedZone = new Route53.HostedZone(
      this,
      "SearchAppPublicHostedZone",
      {
        zoneName: "pillars-reseach.com",
      }
    );

    new Route53.NsRecord(this, "AWSNameServers", {
      zone: hostedZone,
      recordName: "pillars-research.com",
      values: [
        "ns-580.awsdns-08.net.",
        "ns-1248.awsdns-28.org.",
        "ns-1884.awsdns-43.co.uk.",
        "ns-101.awsdns-12.com.",
      ],
    });

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
            domainName: "pillars-research.com",
            validation: ACM.CertificateValidation.fromDns(hostedZone),
          }),
          redirectHTTP: true,
          domainZone: hostedZone,
          publicLoadBalancer: true,
        }
      );

    new Route53.ARecord(this, "LoadBalancerRecord", {
      zone: hostedZone,
      recordName: "pillars-research.com",
      target: Route53.RecordTarget.fromAlias(
        new Route53Targets.LoadBalancerTarget(fargateService.loadBalancer)
      ),
    });
  }
}
