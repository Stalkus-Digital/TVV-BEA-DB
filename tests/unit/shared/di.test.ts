import { describe, expect, it } from "vitest";
import { Container, createToken } from "@/shared/di/container";
import { ModuleRegistry } from "@/shared/di/module-registration";

describe("Container", () => {
  it("register() + resolve() returns the exact same eager instance", () => {
    const container = new Container();
    const token = createToken<{ value: number }>("test.eager");
    const instance = { value: 1 };
    container.register(token, instance);
    expect(container.resolve(token)).toBe(instance);
  });

  it("registerFactory() + resolve() calls the factory once and caches the result", () => {
    const container = new Container();
    const token = createToken<{ id: number }>("test.factory");
    let calls = 0;
    container.registerFactory(token, () => {
      calls += 1;
      return { id: calls };
    });

    const first = container.resolve(token);
    const second = container.resolve(token);

    expect(calls).toBe(1);
    expect(first).toBe(second);
    expect(first.id).toBe(1);
  });

  it("resolve() throws for an unregistered token", () => {
    const container = new Container();
    const token = createToken<unknown>("test.missing");
    expect(() => container.resolve(token)).toThrow(/No registration found/);
  });

  it("has() reflects both eager instances and unresolved factories", () => {
    const container = new Container();
    const eagerToken = createToken<number>("test.has.eager");
    const factoryToken = createToken<number>("test.has.factory");
    const missingToken = createToken<number>("test.has.missing");

    container.register(eagerToken, 1);
    container.registerFactory(factoryToken, () => 2);

    expect(container.has(eagerToken)).toBe(true);
    expect(container.has(factoryToken)).toBe(true);
    expect(container.has(missingToken)).toBe(false);
  });

  it("reset() clears every instance and factory registration", () => {
    const container = new Container();
    const token = createToken<number>("test.reset");
    container.register(token, 1);
    container.reset();
    expect(container.has(token)).toBe(false);
  });
});

describe("ModuleRegistry", () => {
  it("registerModule() then getModule() returns the same definition", () => {
    const registry = new ModuleRegistry();
    const definition = { name: "test-module", register: () => {} };
    registry.registerModule(definition);
    expect(registry.getModule("test-module")).toBe(definition);
  });

  it("registering the same module name twice throws", () => {
    const registry = new ModuleRegistry();
    registry.registerModule({ name: "dup", register: () => {} });
    expect(() => registry.registerModule({ name: "dup", register: () => {} })).toThrow(/already registered/);
  });

  it("getAllModules() returns every registered module", () => {
    const registry = new ModuleRegistry();
    registry.registerModule({ name: "a", register: () => {} });
    registry.registerModule({ name: "b", register: () => {} });
    expect(registry.getAllModules().map((m) => m.name).sort()).toEqual(["a", "b"]);
  });

  it("registerAllInto() calls .register(container) on every registered module", () => {
    const registry = new ModuleRegistry();
    const container = new Container();
    const calledWith: Container[] = [];
    registry.registerModule({ name: "a", register: (c) => calledWith.push(c) });
    registry.registerModule({ name: "b", register: (c) => calledWith.push(c) });

    registry.registerAllInto(container);

    expect(calledWith).toEqual([container, container]);
  });
});
