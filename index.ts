import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';

const lambdaName = 'pulumiPolicyTest';

// Create lambda role
const lambdaRole = new aws.iam.Role(`${lambdaName}-role`, {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: ['lambda.amazonaws.com']
  })
});

// Create lambda policies
const policies = [
  aws.iam.ManagedPolicy.AWSLambdaVPCAccessExecutionRole,
  aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole
];

policies.forEach((policyArn) => {
  const [policyName] = policyArn.split('/').slice(-1);
  new aws.iam.PolicyAttachment(`${lambdaName}-lambda-${policyName}-policy`, {
    roles: [lambdaRole.name],
    policyArn: policyArn
  });
});

const handler = async () => ({ statusCode: 200, body: 'Success' });

const lambda = new aws.lambda.CallbackFunction(lambdaName, {
  callback: handler,
  role: lambdaRole,
  runtime: aws.lambda.Runtime.NodeJS12dX,
  timeout: 900,
  memorySize: 256,
  tags: {
    stack: 'nacelle/development-andrewlaskey',
    project: 'disappearing-policies'
  }
});

// Export the name of the bucket
export const testLambdaName = lambda.name;
export const testLambdaRole = lambdaRole.name;
