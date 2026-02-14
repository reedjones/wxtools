/**
 * Base module contract that all wxtools modules must implement
 */
export interface ModuleContract {
  /** Unique identifier for the module */
  id: string;
  /** Human-readable name */
  name: string;
  /** Module version */
  version: string;
  /** Module dependencies */
  dependencies?: string[];
  /** Initialize the module */
  initialize?(): Promise<void> | void;
  /** Cleanup/teardown the module */
  destroy?(): Promise<void> | void;
}

/**
 * Schema definition for settings, database, and other typed structures
 */
export interface SchemaDefinition<T = any> {
  /** Schema type */
  type: string;
  /** Schema properties */
  properties?: Record<string, any>;
  /** Required fields */
  required?: string[];
  /** Default values */
  default?: T;
  /** Validation rules */
  validation?: ValidationRule[];
}

/**
 * Validation rule for schema fields
 */
export interface ValidationRule {
  /** Rule type (e.g., 'min', 'max', 'pattern', 'custom') */
  type: string;
  /** Rule value */
  value: any;
  /** Error message */
  message?: string;
}

/**
 * Generic result type for operations
 */
export type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

/**
 * Type-safe event emitter interface
 */
export interface TypedEventEmitter<Events extends Record<string, any>> {
  on<K extends keyof Events>(event: K, handler: (data: Events[K]) => void): void;
  off<K extends keyof Events>(event: K, handler: (data: Events[K]) => void): void;
  emit<K extends keyof Events>(event: K, data: Events[K]): void;
}

/**
 * Lifecycle hooks for modules
 */
export interface LifecycleHooks {
  onBeforeInit?(): Promise<void> | void;
  onAfterInit?(): Promise<void> | void;
  onBeforeDestroy?(): Promise<void> | void;
  onAfterDestroy?(): Promise<void> | void;
}

/**
 * Configuration for a module
 */
export interface ModuleConfig {
  /** Enable/disable the module */
  enabled?: boolean;
  /** Module-specific options */
  options?: Record<string, any>;
}

export * from './types';
