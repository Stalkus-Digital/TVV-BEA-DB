import type { Container } from "./container";

/**
 * Every future bounded-context module (src/modules/supplier, inventory,
 * booking, package, ...) implements one of these and registers its
 * services/repositories into the shared Container from register().
 * No modules exist yet — this is the contract they'll follow, not an
 * implementation of any specific module.
 */
export interface ModuleDefinition {
  readonly name: string;
  register(container: Container): void;
}

export class ModuleRegistry {
  private readonly modules = new Map<string, ModuleDefinition>();

  registerModule(module: ModuleDefinition): void {
    if (this.modules.has(module.name)) {
      throw new Error(`Module "${module.name}" is already registered`);
    }
    this.modules.set(module.name, module);
  }

  getModule(name: string): ModuleDefinition | undefined {
    return this.modules.get(name);
  }

  getAllModules(): ModuleDefinition[] {
    return Array.from(this.modules.values());
  }

  /** Calls .register(container) on every registered module, in registration order. */
  registerAllInto(container: Container): void {
    for (const module of this.modules.values()) {
      module.register(container);
    }
  }
}

/** App-wide default module registry. */
export const moduleRegistry = new ModuleRegistry();
