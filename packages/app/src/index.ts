import type { ModuleContract, LifecycleHooks, ModuleConfig } from '@wxtools/core';

/**
 * Module registry for managing WXT extension modules
 * Inspired by Django's app registry pattern
 */
export class ModuleRegistry {
  private modules = new Map<string, RegisteredModule>();
  private initialized = false;

  /**
   * Register a module with the registry
   */
  register(module: ModuleContract, config?: ModuleConfig): void {
    if (this.initialized) {
      throw new Error('Cannot register modules after initialization');
    }

    if (this.modules.has(module.id)) {
      throw new Error(`Module ${module.id} is already registered`);
    }

    this.modules.set(module.id, {
      module,
      config: config || { enabled: true },
      state: 'registered',
    });
  }

  /**
   * Get a registered module by ID
   */
  get(id: string): ModuleContract | undefined {
    return this.modules.get(id)?.module;
  }

  /**
   * Check if a module is registered
   */
  has(id: string): boolean {
    return this.modules.has(id);
  }

  /**
   * Get all registered modules
   */
  getAll(): ModuleContract[] {
    return Array.from(this.modules.values()).map((r) => r.module);
  }

  /**
   * Initialize all registered modules in dependency order
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Sort modules by dependencies
    const sortedModules = this.topologicalSort();

    // Initialize each module
    for (const registeredModule of sortedModules) {
      const { module, config } = registeredModule;

      if (!config.enabled) {
        registeredModule.state = 'disabled';
        continue;
      }

      try {
        await this.initializeModule(module);
        registeredModule.state = 'initialized';
      } catch (error) {
        registeredModule.state = 'error';
        throw new Error(`Failed to initialize module ${module.id}: ${error}`);
      }
    }

    this.initialized = true;
  }

  /**
   * Destroy all initialized modules
   */
  async destroy(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    // Destroy in reverse order
    const modules = Array.from(this.modules.values()).reverse();

    for (const { module, state } of modules) {
      if (state === 'initialized') {
        try {
          await module.destroy?.();
        } catch (error) {
          console.error(`Error destroying module ${module.id}:`, error);
        }
      }
    }

    this.initialized = false;
  }

  /**
   * Initialize a single module with lifecycle hooks
   */
  private async initializeModule(module: ModuleContract & Partial<LifecycleHooks>): Promise<void> {
    await module.onBeforeInit?.();
    await module.initialize?.();
    await module.onAfterInit?.();
  }

  /**
   * Sort modules in topological order based on dependencies
   */
  private topologicalSort(): RegisteredModule[] {
    const sorted: RegisteredModule[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (id: string) => {
      if (visited.has(id)) {
        return;
      }

      if (visiting.has(id)) {
        throw new Error(`Circular dependency detected involving module ${id}`);
      }

      visiting.add(id);

      const registeredModule = this.modules.get(id);
      if (!registeredModule) {
        throw new Error(`Module ${id} not found`);
      }

      const { module } = registeredModule;

      // Visit dependencies first
      for (const depId of module.dependencies || []) {
        if (!this.modules.has(depId)) {
          throw new Error(`Module ${module.id} depends on unregistered module ${depId}`);
        }
        visit(depId);
      }

      visiting.delete(id);
      visited.add(id);
      sorted.push(registeredModule);
    };

    for (const id of this.modules.keys()) {
      visit(id);
    }

    return sorted;
  }
}

/**
 * Internal representation of a registered module
 */
interface RegisteredModule {
  module: ModuleContract;
  config: ModuleConfig;
  state: 'registered' | 'initialized' | 'disabled' | 'error';
}

/**
 * Global module registry instance
 */
export const registry = new ModuleRegistry();

/**
 * Decorator for auto-registering modules
 */
export function WXModule(config?: ModuleConfig) {
  return function <T extends { new (...args: any[]): ModuleContract }>(constructor: T) {
    const instance = new constructor();
    registry.register(instance, config);
    return constructor;
  };
}

export type { ModuleContract, ModuleConfig } from '@wxtools/core';
