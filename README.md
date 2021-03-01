# The Case of the Disappearing Policies

### Problem

After creating and destroying a stack using the Automation API, role permission policies associated with the parent stack are destroyed as well. Pulumi will not recognize that those resources are gone, however, until running a `pulumi refresh`

### How to reproduce with this project

- Set AWS profile: `> pulumi config set aws:profile dev` OR `> export AWS_PROFILE=dev`
- Deploy main project stack: `pulumi stack select nacelle/development` and `pulumi up`
- Confirm deployment by looking in Pulumi dashboard and role in AWS console.
- Run the automation API: `npx ts-node scripts.ts`
- Run the teardown script: `npx ts-node scripts.ts --destroy`
- Refreshing the page in the AWS console for the role will show that the policies are gone.
