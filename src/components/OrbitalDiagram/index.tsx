import React from "react";
import { AvlOrbitalUnit } from "@almadar/ui/illustrations";
import styles from "./styles.module.css";

/**
 * OrbitalDiagram — AVL-based visualization of the Orbital architecture.
 *
 * Shows Entity + Traits + Pages using formal AVL notation.
 * Designed to be embedded in docs and blog posts via MDX.
 *
 * Usage in MDX: <OrbitalDiagram />
 */
export default function OrbitalDiagram() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <AvlOrbitalUnit
          entityName="Order"
          fields={4}
          persistence="persistent"
          traits={[
            { name: "Lifecycle" },
            { name: "Fulfillment" },
          ]}
          pages={[
            { name: "/orders" },
            { name: "/track" },
          ]}
          animated
          className={styles.svg}
        />
        <div className={styles.caption}>
          Orbital Unit = Entity + Traits + Pages
        </div>
      </div>
    </div>
  );
}
