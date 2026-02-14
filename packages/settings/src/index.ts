import type { ValidationRule, Result } from '@wxtools/core';

/**
 * Setting field types
 */
export type SettingFieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multi-select'
  | 'color'
  | 'date'
  | 'json';

/**
 * Setting field definition with UI hints
 */
export interface SettingField<T = any> {
  /** Field key */
  key: string;
  /** Field type */
  type: SettingFieldType;
  /** Display label */
  label: string;
  /** Help text */
  description?: string;
  /** Default value */
  default?: T;
  /** Validation rules */
  validation?: ValidationRule[];
  /** For select/multi-select types */
  options?: Array<{ value: any; label: string }>;
  /** UI hints */
  ui?: {
    /** Field group/section */
    group?: string;
    /** Display order */
    order?: number;
    /** Show/hide based on condition */
    condition?: (settings: any) => boolean;
  };
}

/**
 * Settings schema with typed fields
 */
export interface SettingsSchema<T extends Record<string, any> = Record<string, any>> {
  /** Schema ID */
  id: string;
  /** Schema version */
  version: string;
  /** Setting fields */
  fields: SettingField[];
  /** Schema-level validation */
  validate?: (values: T) => Result<T, string[]>;
}

/**
 * Settings manager for a schema
 */
export class SettingsManager<T extends Record<string, any> = Record<string, any>> {
  constructor(
    private schema: SettingsSchema<T>,
    private storage: SettingsStorage<T>
  ) {}

  /**
   * Get current settings values
   */
  async get(): Promise<T> {
    const stored = await this.storage.load();
    return this.applyDefaults(stored);
  }

  /**
   * Get a single setting value
   */
  async getValue<K extends keyof T>(key: K): Promise<T[K]> {
    const settings = await this.get();
    return settings[key];
  }

  /**
   * Update settings values
   */
  async set(values: Partial<T>): Promise<Result<T, string[]>> {
    const current = await this.get();
    const updated = { ...current, ...values };

    // Validate field-level rules
    const fieldErrors = this.validateFields(updated);
    if (fieldErrors.length > 0) {
      return { ok: false, error: fieldErrors };
    }

    // Validate schema-level rules
    if (this.schema.validate) {
      const result = this.schema.validate(updated);
      if (!result.ok) {
        return result;
      }
    }

    await this.storage.save(updated);
    return { ok: true, value: updated };
  }

  /**
   * Reset to default values
   */
  async reset(): Promise<T> {
    const defaults = this.getDefaults();
    await this.storage.save(defaults);
    return defaults;
  }

  /**
   * Get field definitions for UI generation
   */
  getFields(): SettingField[] {
    return [...this.schema.fields].sort(
      (a, b) => (a.ui?.order || 0) - (b.ui?.order || 0)
    );
  }

  /**
   * Get fields grouped by section
   */
  getFieldsByGroup(): Map<string, SettingField[]> {
    const groups = new Map<string, SettingField[]>();

    for (const field of this.schema.fields) {
      const group = field.ui?.group || 'General';
      if (!groups.has(group)) {
        groups.set(group, []);
      }
      groups.get(group)!.push(field);
    }

    return groups;
  }

  /**
   * Apply default values to partial settings
   */
  private applyDefaults(partial: Partial<T>): T {
    const defaults = this.getDefaults();
    return { ...defaults, ...partial };
  }

  /**
   * Get default values from schema
   */
  private getDefaults(): T {
    const defaults: any = {};
    for (const field of this.schema.fields) {
      if (field.default !== undefined) {
        defaults[field.key] = field.default;
      }
    }
    return defaults as T;
  }

  /**
   * Validate field values against validation rules
   */
  private validateFields(values: T): string[] {
    const errors: string[] = [];

    for (const field of this.schema.fields) {
      const value = values[field.key];

      if (!field.validation) {
        continue;
      }

      for (const rule of field.validation) {
        const error = this.validateRule(field, value, rule);
        if (error) {
          errors.push(error);
        }
      }
    }

    return errors;
  }

  /**
   * Validate a single rule
   */
  private validateRule(field: SettingField, value: any, rule: ValidationRule): string | null {
    switch (rule.type) {
      case 'required':
        if (value === undefined || value === null || value === '') {
          return rule.message || `${field.label} is required`;
        }
        break;

      case 'min':
        if (typeof value === 'number' && value < rule.value) {
          return rule.message || `${field.label} must be at least ${rule.value}`;
        }
        break;

      case 'max':
        if (typeof value === 'number' && value > rule.value) {
          return rule.message || `${field.label} must be at most ${rule.value}`;
        }
        break;

      case 'pattern':
        if (typeof value === 'string' && !new RegExp(rule.value).test(value)) {
          return rule.message || `${field.label} has invalid format`;
        }
        break;

      case 'custom':
        if (typeof rule.value === 'function') {
          const result = rule.value(value);
          if (!result) {
            return rule.message || `${field.label} validation failed`;
          }
        }
        break;
    }

    return null;
  }
}

/**
 * Storage interface for settings
 */
export interface SettingsStorage<T> {
  load(): Promise<Partial<T>>;
  save(settings: T): Promise<void>;
}

/**
 * Browser storage implementation
 */
export class BrowserSettingsStorage<T> implements SettingsStorage<T> {
  constructor(private storageKey: string) {}

  async load(): Promise<Partial<T>> {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const result = await chrome.storage.local.get(this.storageKey);
      return result[this.storageKey] || {};
    }
    // Fallback to localStorage
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : {};
  }

  async save(settings: T): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.set({ [this.storageKey]: settings });
    } else {
      localStorage.setItem(this.storageKey, JSON.stringify(settings));
    }
  }
}

export type { SchemaDefinition, ValidationRule, Result } from '@wxtools/core';
