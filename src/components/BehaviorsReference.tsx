import styles from "./BehaviorsReference.module.css";
import behaviorsData from "../data/stdlib-behaviors.json";

interface BehaviorState {
  name: string;
  isInitial: boolean;
  isFinal: boolean;
}

interface Transition {
  from: string;
  to: string;
  event: string;
  effects?: unknown[];
}

interface StateMachine {
  states: BehaviorState[];
  transitions: Transition[];
}

interface Behavior {
  name: string;
  shortName: string;
  description: string;
  suggestedFor: string[];
  states: string[];
  statesCount: number;
  initial: string;
  events: string[];
  eventsCount: number;
  hasFields: boolean;
  hasComputed: boolean;
  hasTicks: boolean;
  ticksCount: number;
  transitionsCount: number;
  stateMachine?: StateMachine;
  sourceCode?: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  behaviors: Behavior[];
}

function BehaviorCard({ behavior }: { behavior: Behavior }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <div className={styles.cardHeader}>
          <code className={styles.behaviorName}>{behavior.name}</code>
          <div className={styles.countBadges}>
            <span className={styles.countBadge}>
              {behavior.statesCount} states
            </span>
            <span className={styles.countBadge}>
              {behavior.eventsCount} events
            </span>
            <span className={styles.countBadge}>
              {behavior.transitionsCount} transitions
            </span>
          </div>
        </div>

        <p className={styles.behaviorDesc}>{behavior.description}</p>

        {/* States */}
        <div className={styles.infoRow}>
          <div className={styles.infoLabel}>States</div>
          <div className={styles.chips}>
            {behavior.states.map((s) => (
              <span
                key={s}
                className={`${styles.chip} ${s === behavior.initial ? styles.chipInitial : ""}`}
                title={s === behavior.initial ? "Initial state" : undefined}
              >
                {s === behavior.initial ? `● ${s}` : s}
              </span>
            ))}
          </div>
        </div>

        {/* Events */}
        <div className={styles.infoRow}>
          <div className={styles.infoLabel}>Events</div>
          <div className={styles.chips}>
            {behavior.events.map((e) => (
              <span key={e} className={`${styles.chip} ${styles.chipEvent}`}>
                {e}
              </span>
            ))}
          </div>
        </div>

        {/* Suggested for */}
        {behavior.suggestedFor.length > 0 && (
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>Suggested for</div>
            <ul className={styles.suggestedList}>
              {behavior.suggestedFor.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className={styles.transitionsSummary}>
        <span>
          <strong>{behavior.transitionsCount}</strong> transitions
        </span>
        {behavior.hasFields && (
          <span>
            <strong>Fields</strong> ✓
          </span>
        )}
        {behavior.hasComputed && (
          <span>
            <strong>Computed</strong> ✓
          </span>
        )}
        {behavior.hasTicks && (
          <span>
            <strong>{behavior.ticksCount}</strong> ticks
          </span>
        )}
        <span>
          Initial: <strong>{behavior.initial}</strong>
        </span>
      </div>
    </div>
  );
}

function CategorySection({ category }: { category: Category }) {
  return (
    <section id={category.id} className={styles.category}>
      <h2 className={styles.categoryHeader}>
        <span className={styles.categoryIcon}>{category.icon}</span>
        {category.name}
      </h2>
      <p>{category.description}</p>
      <p className={styles.categoryMeta}>
        {category.behaviors.length} behavior
        {category.behaviors.length !== 1 ? "s" : ""}
      </p>
      {category.behaviors.map((b) => (
        <BehaviorCard key={b.name} behavior={b} />
      ))}
    </section>
  );
}

export default function BehaviorsReference() {
  const categories: Category[] = behaviorsData.categories;

  return (
    <div className={styles.wrapper}>
      {categories.map((cat) => (
        <CategorySection key={cat.id} category={cat} />
      ))}
    </div>
  );
}
