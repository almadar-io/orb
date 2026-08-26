/**
 * Service Clients — placeholder
 *
 * Compiler generates the real service clients here (delegating to
 * @almadar/integrations; see orbital-shell-typescript codegen/service.rs).
 * This stub only lets the template build standalone; an emitted app
 * overwrites it wholesale.
 */

export const declaredServices = [] as const;

export const invokedServices = [] as const;

/** Overwritten at emit time with the RuntimeIntegrationManager-backed store install. */
export async function installTenantCredentialStore(_adapter: object): Promise<void> {
  // {{GENERATED_SERVICE_CLIENTS}}
}
