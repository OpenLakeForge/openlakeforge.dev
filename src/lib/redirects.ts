import { repositoryUrl } from "./nav.ts";

// Docs URLs that existed on the site before the openlakeforge docs
// restructure (OpenLakeForge/openlakeforge#508). Merged pages point at the
// page that now holds their content; maintainer pages that left the
// published docs point at their source on GitHub.
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
  "/docs/setup/identity-secret-rotation": "/docs/setup/github-oauth-app/#rotate-secrets",
  "/docs/guides/add-a-source": "/docs/guides/data-products/#add-a-source",
  "/docs/guides/add-a-resource": "/docs/guides/data-products/#add-a-resource-to-an-existing-source",
  "/docs/guides/add-a-domain": "/docs/guides/data-products/#add-a-domain",
  "/docs/guides/add-a-gold-model": "/docs/guides/data-products/#add-a-data-product",
  "/docs/guides/ownership-identities": "/docs/guides/data-products/#how-a-project-is-laid-out",
  "/docs/reference/ci-cd": "/docs/guides/promote-dev-to-prod/",
  "/docs/reference/domain-descriptor": "/docs/reference/descriptors/",
  "/docs/reference/lakehouse-descriptor": "/docs/reference/descriptors/#lakehouseyaml",
  "/docs/reference/source-descriptor": "/docs/reference/descriptors/#sourceyaml",
  "/docs/reference/services-and-routes": "/docs/reference/components/#service-urls",
  "/docs/architecture": "/docs/architecture/overview/",
  // The tutorial lost its lesson-8 gap: 9 and 10 became 8 and 9.
  "/docs/tutorial/09-add-prod-and-promote": "/docs/tutorial/08-add-prod-and-promote/",
  "/docs/tutorial/10-deploy-to-the-cloud": "/docs/tutorial/09-deploy-to-the-cloud/",
};

const maintainerPages = [
  "reference/component-catalog",
  "architecture/aws-eks-poc",
  "architecture/azure-aks-poc",
  "architecture/floe-validation",
  "architecture/identity-callers",
  "architecture/identity-credentials",
  "architecture/identity-service-permissions",
  "architecture/identity-sessions-and-recovery",
  "architecture/local-stack-contracts",
  "architecture/project-revisions",
  "architecture/provider-contracts",
  "architecture/diagrams/chart3-ephemeral-job-lifecycle",
];

const adrs = [
  "0001-platform-baseline-and-component-stack",
  "0002-deployment-lifecycle",
  "0003-provider-contracts",
  "0004-medallion-layout-and-catalog-namespaces",
  "0005-descriptor-model",
  "0006-dagster-runtime-and-code-locations",
  "0007-governance-and-lineage",
  "0008-olf-owns-orchestration-and-toolchain",
  "0009-distribution",
  "0010-cloud-provider-implementations",
  "0011-deployment-profile-and-stages",
  "0012-project-revisions-and-promotion",
  "0013-service-access-and-ingress",
  "0014-identity-and-authorization",
  "0015-polaris-identity-provider-evaluation",
  "0016-trino-workload-authentication",
  "0017-local-network-policy-and-rbac",
  "0018-github-is-the-forge",
  "0019-data-plane-authorization-deferral",
];

export const docsRedirects: Record<string, string> = {
  ...merged,
  ...Object.fromEntries(maintainerPages.map((page) => [`/docs/${page}`, source(`docs/${page}.md`)])),
  "/docs/adr": source("docs/adr/README.md"),
  ...Object.fromEntries(adrs.map((adr) => [`/docs/adr/${adr}`, source(`docs/adr/${adr}.md`)])),
};
