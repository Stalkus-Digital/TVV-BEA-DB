export type Token<T> = symbol & { readonly __type?: T };

export function createToken<T>(description: string): Token<T> {
  return Symbol(description) as Token<T>;
}

type Factory<T> = () => T;

/**
 * Lightweight, hand-rolled DI container — no inversify/tsyringe dependency
 * installed for this. Supports both eager instance registration and lazy
 * factories resolved (and cached) on first use.
 */
export class Container {
  private readonly instances = new Map<symbol, unknown>();
  private readonly factories = new Map<symbol, Factory<unknown>>();

  register<T>(token: Token<T>, instance: T): void {
    this.instances.set(token, instance);
  }

  registerFactory<T>(token: Token<T>, factory: Factory<T>): void {
    this.factories.set(token, factory as Factory<unknown>);
  }

  resolve<T>(token: Token<T>): T {
    if (this.instances.has(token)) {
      return this.instances.get(token) as T;
    }
    const factory = this.factories.get(token);
    if (!factory) {
      throw new Error(`No registration found for token: ${token.toString()}`);
    }
    const instance = factory() as T;
    this.instances.set(token, instance);
    return instance;
  }

  has(token: Token<unknown>): boolean {
    return this.instances.has(token) || this.factories.has(token);
  }

  /** Test-only escape hatch — not for use in application code paths. */
  reset(): void {
    this.instances.clear();
    this.factories.clear();
  }
}

/** App-wide default container. Modules register into this via ModuleRegistry. */
export const container = new Container();
