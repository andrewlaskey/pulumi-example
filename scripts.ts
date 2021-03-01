import { deploy, destroy } from './integration/automation';

const isDestoryCmd = process.argv.slice(2).includes('--destroy');

function harnessStandup() {
  console.info('******** INTEGRATION TEST INFRA SETUP ********');
  return deploy();
}

function harnessTeardown() {
  console.info('******** INTEGRATION TEST INFRA TEARDOWN ********');
  return destroy();
}

if (isDestoryCmd) {
  harnessTeardown().catch(console.error);
} else {
  harnessStandup().catch((err) => {
    console.error(err);
  });
}
