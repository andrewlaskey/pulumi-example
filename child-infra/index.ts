import * as aws from "@pulumi/aws";
import { Output } from "@pulumi/pulumi";
import { LocalWorkspace } from "@pulumi/pulumi/x/automation";
import * as path from "path";

type ChildStackOutput = {
  integrationLambdaName: Output<string>;
};

const cwd = process.cwd();

/**
 * The path to the root directory of the project
 */
const rootPath = cwd.includes("child-infra") ? path.resolve(cwd, "../") : cwd;

async function deployChildInfra(): Promise<ChildStackOutput> {
  const parentStack = await LocalWorkspace.selectStack({
    stackName: "parent-stack",
    workDir: rootPath,
  });

  const parentStackOutputs = await parentStack.outputs();
  const parentLambdaName = parentStackOutputs.testLambdaName.value;

  const lambdaName = "pulumiPolicyTestChild";

  // Create lambda role
  const lambdaRole = new aws.iam.Role(`${lambdaName}-role`, {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
      Service: ["lambda.amazonaws.com"],
    }),
  });

  // Create lambda policies
  const policies = [
    aws.iam.ManagedPolicy.AWSLambdaVPCAccessExecutionRole,
    aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
  ];

  policies.forEach((policyArn) => {
    const [policyName] = policyArn.split("/").slice(-1);
    new aws.iam.PolicyAttachment(`${lambdaName}-lambda-${policyName}-policy`, {
      roles: [lambdaRole.name],
      policyArn: policyArn,
    });
  });

  const handler = async () => ({ statusCode: 200, body: "Success" });

  const lambda = new aws.lambda.CallbackFunction(lambdaName, {
    callback: handler,
    role: lambdaRole,
    runtime: aws.lambda.Runtime.NodeJS12dX,
    timeout: 900,
    memorySize: 256,
    tags: {
      stack: "child-stack",
      project: "disappearing-policies",
    },
    environment: {
      variables: {
        PARENT_LAMBDA_NAME: parentLambdaName,
      },
    },
  });

  return {
    integrationLambdaName: lambda.name,
  };
}

const infraPromise = deployChildInfra().catch(console.error);

export const integrationLambdaName = infraPromise.then(
  (res) => res && res.integrationLambdaName
);
