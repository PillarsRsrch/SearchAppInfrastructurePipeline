import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as Route53 from "aws-cdk-lib/aws-route53";
import * as EC2 from "aws-cdk-lib/aws-ec2";
import * as IAM from "aws-cdk-lib/aws-iam";
import * as ECR from "aws-cdk-lib/aws-ecr";
import { readFileSync } from "fs";
import * as CloudFront from "aws-cdk-lib/aws-cloudfront";
import * as CloudFrontOrigins from "aws-cdk-lib/aws-cloudfront-origins";
import * as ACM from "aws-cdk-lib/aws-certificatemanager";
import * as Route53Targets from "aws-cdk-lib/aws-route53-targets";

export class SearchAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const domainName = "pillars-research.com";
    const hostedZone = Route53.HostedZone.fromHostedZoneAttributes(
      this,
      "SearchAppPublicHostedZone",
      {
        hostedZoneId: "Z00651222IWOQ6SX5LSE0",
        zoneName: domainName,
      }
    );
    const vpc = new EC2.Vpc(this, `Search-App-${id}`, {
      cidr: "10.0.0.0/16",
      natGateways: 0,
      subnetConfiguration: [
        {
          name: "public",
          cidrMask: 24,
          subnetType: EC2.SubnetType.PUBLIC,
        },
      ],
    });
    const appRole = new IAM.Role(this, `Search-App-${id}-Role`, {
      assumedBy: new IAM.ServicePrincipal("ec2.amazonaws.com"),
    });
    const repository = ECR.Repository.fromRepositoryName(
      this,
      "Search-App-Repository",
      "pillars-app"
    );
    repository.grantPull(appRole);
    const appSecurityGroup = new EC2.SecurityGroup(
      this,
      `Search-App-${id}-Security-Group`,
      {
        vpc,
        allowAllOutbound: true,
        securityGroupName: `Search-App-${id}-Security-Group`,
      }
    );
    appSecurityGroup.addIngressRule(
      EC2.Peer.anyIpv4(),
      EC2.Port.tcp(22),
      "Allows SSH access from internet"
    );
    appSecurityGroup.addIngressRule(
      EC2.Peer.anyIpv4(),
      EC2.Port.tcp(80),
      "Allows HTTP access from internet"
    );
    appSecurityGroup.addIngressRule(
      EC2.Peer.anyIpv4(),
      EC2.Port.tcp(443),
      "Allows HTTPS access from internet"
    );

    const searchAppInstance = new EC2.Instance(
      this,
      `Search-App-${id}-Instance`,
      {
        vpc,
        vpcSubnets: {
          subnetType: EC2.SubnetType.PUBLIC,
        },
        role: appRole,
        securityGroup: appSecurityGroup,
        instanceName: `Search-App-${id}-Compute-Instance`,
        instanceType: EC2.InstanceType.of(
          EC2.InstanceClass.T2,
          EC2.InstanceSize.MICRO
        ),
        machineImage: EC2.MachineImage.latestAmazonLinux({
          generation: EC2.AmazonLinuxGeneration.AMAZON_LINUX_2,
        }),
        keyName: `Search-App-${id}-Key`,
      }
    );

    const script = readFileSync("./lib/scripts/run-app.sh", "utf-8");
    searchAppInstance.addUserData(script);

    const searchAppCertificate = ACM.Certificate.fromCertificateArn(
      this,
      `Search-App-${id}-Certificate`,
      "arn:aws:acm:us-east-1:061155101849:certificate/f0dd2ee5-1f87-4893-ac28-9c76ab72a18e"
    );

    const searchAppDistribution = new CloudFront.Distribution(
      this,
      `Search-App-${id}-Distribution`,
      {
        certificate: searchAppCertificate,
        domainNames: [domainName],
        defaultBehavior: {
          origin: new CloudFrontOrigins.HttpOrigin(
            searchAppInstance.instancePublicDnsName,
            {
              httpPort: 80,
              protocolPolicy: CloudFront.OriginProtocolPolicy.HTTP_ONLY,
            }
          ),
          viewerProtocolPolicy:
            CloudFront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
      }
    );

    new Route53.ARecord(this, `Search-App-${id}-Alias-Record`, {
      zone: hostedZone,
      recordName: domainName,
      target: Route53.RecordTarget.fromAlias(
        new Route53Targets.CloudFrontTarget(searchAppDistribution)
      ),
    });
  }
}
