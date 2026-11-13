import { repositoryUrl } from "./nav.ts";

// Docs URLs the site has published that the synced release no longer has.
// Merged or moved pages point at the page that now holds their content;
// maintainer pages that left the published docs point at their source on
// GitHub. A redirect wins over a synced page at the same URL, so never keep
// one for a page the release publishes.
const source = (path: string) => `${repositoryUrl}/blob/main/${path}`;

const merged: Record<string, string> = {
  "/docs/getting-started/first-data-product": "/docs/tutorial/02-ingest-a-source/",
  "/docs/setup/local": "/docs/guides/local-installation/",
  "/docs/guides/install-options": "/docs/guides/local-installation/",
  "/docs/guides/local-access": "/docs/guides/local-installation/#access-the-services",
  "/docs/guides/tear-down": "/docs/guides/local-installation/#tear-down",
  "/docs/guides/status-and-diagnostics": "/docs/guides/troubleshooting/",
  "/docs/setup/aws": "/docs/guides/cloud/deploy-to-aws/",
  "/docs/setup/azure": "/docs/guides/cloud/deploy-to-azure/",
  "/docs/setup/cloud-poc-setup": "/docs/guides/cloud/deploy-to-aws/",
  "/docs/guides/cloud/prepare-a-cloud-account": "/docs/guides/cloud/deploy-to-aws/#prerequisites",
  "/docs/setup/github-oauth-app": "/docs/guides/identity/connect-github/",
  "/docs/setup/identity-secret-rotation": "/docs/guides/identity/rotate-secrets/",
  "/docs/guides/add-a-source": "/docs/guides/data-products/#add-a-source",
  "/docs/guides/add-a-resource": "/docs/guides/data-products/#add-a-resource-to-an-existing-source",
  "/docs/guides/add-a-domain": "/docs/guides/data-products/#add-a-domain",
  "/docs/guides/add-a-gold-model": "/docs/guides/data-products/#add-a-data-product",
  "/docs/guides/ownership-identities": "/docs/guides/data-products/#how-a-project-is-laid-out",
  "/docs/reference/ci-cd": "/docs/guides/promote-dev-to-prod/",
  "/docs/reference/domain-descriptor": "/docs/reference/descriptors/",
  "/docs/reference/lakehouse-descriptor": "/docs/reference/descriptors/#governanceyml",
  "/docs/reference/source-descriptor": "/docs/reference/descriptors/#sourceyaml",
  "/docs/reference/services-and-routes": "/docs/reference/components/#service-urls",
  "/docs/release/compatibility-matrix": "/docs/reference/compatibility-matrix/",
  "/docs/architecture": "/docs/architecture/overview/",
  // Lesson 8 became "Sign in with GitHub", so promotion and the cloud went
  // back to lessons 9 and 10.
  "/docs/tutorial/08-add-prod-and-promote": "/docs/tutorial/09-add-prod-and-promote/",
  "/docs/tutorial/09-deploy-to-the-cloud": "/docs/tutorial/10-deploy-to-the-cloud/",
};

// Published URL → source file under docs/.
const maintainerPages: Record<string, string> = {
  "reference/component-catalog": "reference/component-catalog",
  "release/component-catalog": "reference/component-catalog",
  "architecture/aws-eks-poc": "architecture/aws-eks-poc",
  "architecture/azure-aks-poc": "architecture/azure-aks-poc",
  "architecture/floe-validation": "architecture/floe-validation",
  "architecture/identity-callers": "architecture/identity/identity-callers",
  "architecture/identity-credentials": "architecture/identity/identity-credentials",
  "architecture/identity-service-permissions": "architecture/identity/identity-service-permissions",
  "architecture/identity-sessions-and-recovery": "architecture/identity/identity-sessions-and-recovery",
  "architecture/local-stack-contracts": "architecture/local-stack-contracts",
  "architecture/project-revisions": "architecture/project-revisions",
  "architecture/provider-contracts": "architecture/provider-contracts",
  "architecture/diagrams/chart3-ephemeral-job-lifecycle": "architecture/diagrams/chart3-ephemeral-job-lifecycle",
};

export const docsRedirects: Record<string, string> = {
  ...merged,
  ...Object.fromEntries(Object.entries(maintainerPages).map(([page, file]) => [`/docs/${page}`, source(`docs/${file}.md`)])),
};
