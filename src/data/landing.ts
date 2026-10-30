/**
 * Copy for the presentation page. It follows the Figma "Website → Presentation"
 * frame, whose text comes from the openlakeforge README. Keep the two in step:
 * a claim here must be true of the released platform.
 */

/**
 * The page's sections as a sounding line: each one ten metres deeper. The ids
 * are the <section> ids in src/components/landing/; keep them in step.
 */
export const sections = [
  { id: "surface", label: "Surface" },
  { id: "how-it-works", label: "How it works" },
  { id: "why", label: "Why OpenLakeForge" },
  { id: "everything-as-code", label: "Everything as code" },
  { id: "stages", label: "From commit to PROD" },
  { id: "your-project", label: "Your project" },
  { id: "deploy-anywhere", label: "Deploy anywhere" },
  { id: "good-fit", label: "Is it a good fit?" },
  { id: "get-started", label: "Get started" },
].map((s, i) => ({ ...s, depth: `${String(i * 10).padStart(2, "0")} m` }));

/** The latest release, shown in the announcement bar. */
export const release = { version: "0.5.0-alpha.1", note: "Sign in with GitHub: your team decides your role across every service." };

/** The README Quickstart. Phase 3 reads these from the synced README instead. */
export const installCommands = [
  { command: "uv tool install openlakeforge", comment: "" },
  { command: "olf init", comment: "openlakeforge.yaml + lakehouse_code/" },
  { command: "olf deploy --provider local", comment: "kind cluster + the whole platform" },
];

export const components = [
  { key: "dlt", name: "dlt", file: "dlt.png" },
  { key: "floe", name: "Floe", file: "floe.png" },
  { key: "iceberg", name: "Iceberg", file: "iceberg.png" },
  { key: "polaris", name: "Polaris", file: "polaris.png" },
  { key: "dbt", name: "dbt", file: "dbt.png" },
  { key: "trino", name: "Trino", file: "trino.svg" },
  { key: "dagster", name: "Dagster", file: "dagster.svg" },
  { key: "openmetadata", name: "OpenMetadata", file: "openmetadata.svg" },
  { key: "superset", name: "Superset", file: "superset.png" },
  { key: "k8s", name: "Kubernetes", file: "k8s.svg" },
];

export const layers = [
  { tag: "bronze", label: "Bronze", tool: "dlt", text: "Source files land as CSV in object storage." },
  { tag: "silver", label: "Silver", tool: "Floe", text: "Technical contracts validate them into Iceberg tables." },
  { tag: "gold", label: "Gold", tool: "dbt-trino on Trino", text: "Business marts are modelled in SQL and run in the query engine." },
];

export const reasons = [
  { eyebrow: "Sovereign", title: "Yours end to end", text: "Your infrastructure, your storage, your data: no third-party service in the data path. Apache-2.0." },
  { eyebrow: "Small teams", title: "Run by one data team", text: "Assembled, pinned and tested, so you don't need a platform engineer to start." },
  { eyebrow: "Modular", title: "Start with the core", text: "Run the core data path alone, add governance and dashboards when you need them." },
  { eyebrow: "Portable", title: "Built to move", text: "Designed so local Kubernetes, AWS and Azure share the same platform contracts. Local leads; the cloud follows." },
  { eyebrow: "Open format", title: "Apache Iceberg", text: "Storage stays independent from the engines that read it." },
  { eyebrow: "Batteries included", title: "Infrastructure included", text: "Kubernetes, Terraform and Helm ship with the platform, pinned and tested." },
];

export const codeLayers = [
  { name: "Infrastructure", what: "Terraform + Helm, pinned in the release", file: "infra/ · component-catalog.yaml" },
  { name: "Platform", what: "Provider, stages, preset, identity", file: "openlakeforge.yaml" },
  { name: "Data products", what: "Domains, products, sources", file: "lakehouse.yaml · source.yaml" },
  { name: "Bronze → Silver", what: "Ingestion and technical contracts", file: "bronze/ · silver/" },
  { name: "Gold", what: "Business marts in SQL", file: "gold/ (dbt)" },
  { name: "Orchestration", what: "One job per product", file: "pipelines/dagster/" },
  { name: "Dashboards", what: "Reports over Gold", file: "dashboards/superset/" },
  { name: "Delivery", what: "Build once, promote DEV → PROD", file: "GitHub Actions · revisions" },
];

/** Illustrative agent session: real olf commands, ending in a reviewed pull request. */
export const agentSession: { kind: "you" | "cmd" | "note" | "ok" | "wait" | "gap"; text?: string; comment?: string }[] = [
  { kind: "you", text: "Add our daily orders export and a revenue-by-region mart." },
  { kind: "gap" },
  { kind: "note", text: "reads   openlakeforge.yaml, lakehouse.yaml" },
  { kind: "cmd", text: "olf source new orders" },
  { kind: "note", text: "writes  silver/sales/orders.yaml", comment: "data contract" },
  { kind: "cmd", text: "olf product new sales/revenue_by_region" },
  { kind: "note", text: "writes  gold/revenue_by_region/models/*.sql" },
  { kind: "note", text: "opens   pull request #42" },
  { kind: "gap" },
  { kind: "ok", text: "build-revision   sha256:3f9c…" },
  { kind: "ok", text: "deploy-stage dev · e2e passed" },
  { kind: "wait", text: "prod waits for your approval" },
];

export const projectTree = [
  { line: "my-lakehouse/", comment: "" },
  { line: "├── openlakeforge.yaml", comment: "provider, stages" },
  { line: "└── lakehouse_code/", comment: "" },
  { line: "    ├── lakehouse.yaml", comment: "domains, products" },
  { line: "    ├── bronze/", comment: "dlt sources" },
  { line: "    ├── silver/", comment: "data contracts" },
  { line: "    ├── gold/", comment: "dbt models" },
  { line: "    ├── pipelines/dagster/", comment: "jobs" },
  { line: "    └── dashboards/superset/", comment: "" },
];

export const presets = [
  { name: "Slim", isDefault: true, includes: "Ingestion, validation, Iceberg, catalog, Trino, dbt and Dagster.", when: "The shortest path to a working lakehouse." },
  { name: "Full", isDefault: false, includes: "Slim + OpenMetadata governance + Superset dashboards.", when: "You also want lineage, a catalog UI and dashboards." },
];

/**
 * Each target's maturity, as the synced release's guides state it. A release
 * that changes a provider's status updates its `status` here.
 */
export const targets = [
  {
    eyebrow: "Local",
    title: "kind on Docker",
    text: "The whole platform on your machine. Plain HTTP on *.olf.localhost, no certificates.",
    command: "olf deploy --provider local",
    status: { label: "Supported · alpha", tone: "supported" },
    guide: "/docs/guides/local-installation/",
  },
  {
    eyebrow: "AWS",
    title: "EKS, S3, RDS, Glue",
    text: "Managed Kubernetes, storage, database and catalog. Passes the end-to-end suite in a test account; not production-hardened.",
    command: "olf deploy --provider aws",
    status: { label: "Alpha · test accounts", tone: "preview" },
    guide: "/docs/guides/cloud/deploy-to-aws/",
  },
  {
    eyebrow: "Azure",
    title: "AKS and ACR",
    text: "The in-cluster platform services on Azure Kubernetes Service. Checked with terraform validate and plan, not yet deployed live.",
    command: "olf deploy --provider azure",
    status: { label: "Preview · plan only", tone: "experimental" },
    guide: "/docs/guides/cloud/deploy-to-azure/",
  },
] as const;

/** What a first local deploy needs, from the installation guide's Hardware section. */
export const requirements = {
  summary: "Docker with 4 CPUs and 16 GB of memory, and up to 100 GB of disk",
  firstDeploy: "the first deploy takes several minutes while images download",
  href: "/docs/guides/local-installation/#hardware",
};

export const fit = {
  yes: [
    "Teams whose data must stay in their own infrastructure: sovereignty, residency or sector rules (public sector, health, finance)",
    "Data teams already on Kubernetes that want an open, predictable-cost alternative to a proprietary warehouse",
    "Consultancies and integrators deploying the same tested platform for several clients",
    "A small team that wants a working batch lakehouse without building the platform first",
  ],
  notYet: [
    "Streaming workloads: v1 is batch-first",
    "Large organisations whose platform team already builds its own",
    "Teams that want a fully managed SaaS",
    "A small team with no Kubernetes and no residency constraint: a managed warehouse is simpler",
    "Production on AWS or Azure: the cloud targets are alpha and preview until the cloud beta",
  ],
};
