/**
 * The /floe/ page. Every claim is from Floe's README, and the example was run
 * with floe-python 0.10.1: `floe run -c floe.yml` on `orders.csv` printed the
 * lines below and wrote the rejected rows as shown.
 */
export const floeRepositoryUrl = "https://github.com/OpenLakeForge/floe";
export const floeDocsUrl = `${floeRepositoryUrl}/blob/main/docs/summary.md`;
export const floeConfigUrl = `${floeRepositoryUrl}/blob/main/docs/config.md`;

export const floeInstall = [
  { command: "pip install floe-python", comment: "Python 3.11 or later" },
  { command: "floe validate -c floe.yml", comment: "check the contract" },
  { command: "floe run -c floe.yml", comment: "run the gate" },
];

export const gate = [
  {
    title: "One YAML contract",
    text: "Source, schema, checks, accepted output, rejected output, write mode, metadata and reporting live in one human-readable file, kept in Git.",
  },
  {
    title: "A gate per entity",
    text: "File-level checks on structure and headers, row-level casts and not_null checks, then unique checks across the input and the data already accepted.",
  },
  {
    title: "Rejects with reasons",
    text: "Accepted rows go to Parquet or Iceberg. Rejected rows go to a separate sink with the rule each one broke, and every run writes a JSON report.",
  },
];

export const sampleCsv = `order_id,amount
1001,19.90
1002,not_a_number
1003,42.00
1003,7.50
,5.00`;

export const sampleContract = `version: "0.10"
entities:
  - name: orders
    source: { format: csv, path: ./in, options: { separator: "," } }
    sink:
      accepted: { format: parquet, path: ./out/accepted/orders }
      rejected: { format: csv, path: ./out/rejected/orders }
    policy: { severity: reject }
    schema:
      columns:
        - { name: order_id, type: string, nullable: false, unique: true }
        - { name: amount, type: "decimal(10,2)" }`;

export const sampleRun = `==> entity orders (severity=reject, format=csv)
  REJECTED orders.csv rows=5 accepted=2 rejected=3 …

Totals: files=1 rows=5 accepted=2 rejected=3`;

export const sampleRejected = `order_id,amount,__floe_row_index,__floe_errors
1002,not_a_number,1,"[{""rule"":""cast_error"",""column"":""amount"",""message"":""invalid value for target type""}]"
1003,7.50,3,"[{""rule"":""unique"",""column"":""order_id"",""message"":""duplicate value""}]"
,5.00,4,"[{""rule"":""not_null"",""column"":""order_id"",""message"":""required value missing""}]"`;

export const supports = [
  { label: "Reads", value: "CSV, TSV, JSON, Parquet, ORC, Avro, XLSX and XML" },
  { label: "Writes", value: "Parquet, and Apache Iceberg with SCD1 merge" },
  { label: "Storage", value: "Local files, S3 and S3-compatible stores" },
  { label: "Catalogs", value: "Iceberg REST (Polaris) and AWS Glue" },
  { label: "Runs as", value: "A CLI, a Docker image, a Python library, or a job under Airflow or Dagster" },
];
