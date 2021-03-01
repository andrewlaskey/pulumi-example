import { deploy, destroy } from "./child-infra/automation";

const isDestoryCmd = process.argv.slice(2).includes("--destroy");

function harnessStandup() {
  console.info("******** CHILD INFRA SETUP ********");
  return deploy();
}

function harnessTeardown() {
  console.info("******** CHILD INFRA TEARDOWN ********");
  return destroy();
}

if (isDestoryCmd) {
  harnessTeardown().catch(console.error);
} else {
  harnessStandup().catch((err) => {
    console.error(err);
  });
}
