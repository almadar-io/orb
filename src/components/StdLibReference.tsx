import { useState, useMemo } from "react";
import styles from "./StdLibReference.module.css";
import modulesData from "../data/stdlib-modules.json";

interface Param {
  name: string;
  type: string;
  description: string;
  optional?: boolean;
  defaultValue?: unknown;
}

interface Operator {
  name: string;
  shortName: string;
  displayName: string;
  description: string;
  params: Param[];
  example: string;
  returnType: string;
  returnTypeHuman: string;
  arityHuman: string;
  minArity: number;
  maxArity: number | null;
  hasSideEffects: boolean;
  acceptsLambda: boolean;
  pureFunction: boolean;
}

interface Module {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  operators: Operator[];
  operatorCount?: number;
}

function OperatorCard({ op }: { op: Operator }) {
  return (
    <div
      className={`${styles.card} ${op.pureFunction ? styles.pure : styles.effect}`}
      data-name={op.name}
    >
      <div className={styles.cardHeader}>
        <code className={styles.opName}>{op.name}</code>
        <span
          className={`${styles.badge} ${op.pureFunction ? styles.badgePure : styles.badgeEffect}`}
        >
          {op.pureFunction ? "✨ Pure" : "⚡ Effect"}
        </span>
      </div>

      <p className={styles.opDesc}>{op.description}</p>

      {op.params.length > 0 && (
        <table className={styles.paramsTable}>
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {op.params.map((p) => (
              <tr key={p.name}>
                <td>
                  <code>{p.name}</code>
                  {p.optional && <em> (opt)</em>}
                </td>
                <td>
                  <code>{p.type}</code>
                </td>
                <td>
                  {p.description}
                  {p.defaultValue !== undefined && (
                    <>
                      {" "}
                      (default: <code>{String(p.defaultValue)}</code>)
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {op.example && (
        <div className={styles.example}>
          <div className={styles.exampleLabel}>Example</div>
          <code className={styles.exampleCode}>{op.example}</code>
        </div>
      )}

      <div className={styles.opMeta}>
        <span>
          Returns: <code>{op.returnTypeHuman}</code>
        </span>
        <span>Args: {op.arityHuman}</span>
      </div>
    </div>
  );
}

function ModuleSection({
  module,
  query,
}: {
  module: Module;
  query: string;
}) {
  const filtered = useMemo(() => {
    if (!query) return module.operators;
    const q = query.toLowerCase();
    return module.operators.filter(
      (op) =>
        op.name.toLowerCase().includes(q) ||
        op.description.toLowerCase().includes(q) ||
        op.shortName.toLowerCase().includes(q)
    );
  }, [module.operators, query]);

  if (filtered.length === 0) return null;

  const count = module.operatorCount ?? module.operators.length;

  return (
    <section id={module.id} className={styles.module}>
      <h2 className={styles.moduleHeader}>
        <span className={styles.moduleIcon}>{module.icon}</span>
        {module.displayName}
      </h2>
      <p>{module.description}</p>
      <p className={styles.moduleMeta}>{count} operators</p>
      <div className={styles.grid}>
        {filtered.map((op) => (
          <OperatorCard key={op.name} op={op} />
        ))}
      </div>
    </section>
  );
}

export default function StdLibReference() {
  const [query, setQuery] = useState("");
  const modules: Module[] = modulesData.modules;

  const visibleCount = useMemo(() => {
    if (!query) return modules.length;
    const q = query.toLowerCase();
    return modules.filter((m) =>
      m.operators.some(
        (op) =>
          op.name.toLowerCase().includes(q) ||
          op.description.toLowerCase().includes(q)
      )
    ).length;
  }, [modules, query]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchBar}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Filter operators…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Filter standard library operators"
        />
      </div>

      {visibleCount === 0 && (
        <p className={styles.noResults}>No operators match "{query}".</p>
      )}

      {modules.map((m) => (
        <ModuleSection key={m.id} module={m} query={query} />
      ))}
    </div>
  );
}
