import { LocalWorkspace, OutputMap } from "@pulumi/pulumi/x/automation";
import path from "path";

const cwd = process.cwd();

/**
 * The path to the root directory of the project
 */
const rootPath = cwd.includes("child-infra") ? path.resolve(cwd, "../") : cwd;

/**
 * The path to the child tests in this project
 */
const childPath = `${rootPath}/child-infra`;
const childStack = `child-stack`;

async function deploy(): Promise<OutputMap> {
  const stackArgs = {
    stackName: childStack,
    workDir: childPath,
  };

  console.info(`Initializing stack: ${stackArgs.stackName}`);
  const stack = await LocalWorkspace.createOrSelectStack(stackArgs);
  await stack.workspace.installPlugin("aws", "v3.6.1");
  await stack.setConfig("aws:region", { value: "us-east-2" });
  await stack.refresh({ onOutput: console.info });

  console.info("Updating stack...");
  const up = await stack.up({ onOutput: console.info });
  console.info("Finished updating.");
  return up.outputs;
}

/**
 * @description Uses the Pulumi automation API to destroy the
 * temporary child stack resourcs
 *
 * @returns undefined
 */
async function destroy(): Promise<void> {
  try {
    const stackArgs = {
      stackName: childStack,
      workDir: childPath,
    };

    console.info(`Destroying stack: ${stackArgs.stackName}`);
    const stack = await LocalWorkspace.createOrSelectStack(stackArgs);
    await stack.destroy({ onOutput: console.log });
  } catch (err) {
    // There is an error when tearing down the infra where Pulumi tries
    // to pass an argument that is unrecognized to its own command. Everything
    // works, but this error still appears. This code will bypass this error
    // so that the process continues and doesn't show the ugly error
    const hasPageSizeError = err.message.includes("--page-size");

    if (hasPageSizeError) {
      return;
    }

    console.error(err);
  }
}

export { deploy, destroy };
