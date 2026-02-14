import type { Result } from '@wxtools/core';

/**
 * Database table schema
 */
export interface TableSchema {
  name: string;
  version: number;
  columns: ColumnDefinition[];
  indexes?: IndexDefinition[];
  primaryKey?: string;
}

/**
 * Column definition
 */
export interface ColumnDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'json';
  required?: boolean;
  unique?: boolean;
  default?: any;
}

/**
 * Index definition
 */
export interface IndexDefinition {
  name: string;
  columns: string[];
  unique?: boolean;
}

/**
 * Database migration
 */
export interface Migration {
  version: number;
  up: (db: DatabaseConnection) => Promise<void>;
  down?: (db: DatabaseConnection) => Promise<void>;
}

/**
 * Database connection interface
 */
export interface DatabaseConnection {
  execute(query: string, params?: any[]): Promise<any>;
  query<T>(query: string, params?: any[]): Promise<T[]>;
  close(): Promise<void>;
}

/**
 * Schema-first database manager
 */
export class Database {
  private db: IDBDatabase | null = null;
  private migrations: Migration[] = [];
  private currentVersion = 0;

  constructor(private name: string) {}

  /**
   * Register a migration
   */
  addMigration(migration: Migration): void {
    this.migrations.push(migration);
    this.migrations.sort((a, b) => a.version - b.version);
    this.currentVersion = Math.max(this.currentVersion, migration.version);
  }

  /**
   * Initialize database with migrations
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.name, this.currentVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = async (event) => {
        this.db = request.result;
        const oldVersion = event.oldVersion;

        // Run migrations in order
        for (const migration of this.migrations) {
          if (migration.version > oldVersion) {
            try {
              await migration.up(this.createConnection());
            } catch (error) {
              console.error(`Migration ${migration.version} failed:`, error);
              reject(error);
            }
          }
        }
      };
    });
  }

  /**
   * Create a table from schema
   */
  createTable<T>(schema: TableSchema): Table<T> {
    return new Table(schema, this);
  }

  /**
   * Get underlying IndexedDB database
   */
  getDB(): IDBDatabase {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  /**
   * Create a database connection for migrations
   */
  private createConnection(): DatabaseConnection {
    const db = this.db;
    if (!db) {
      throw new Error('Database not initialized');
    }

    return {
      execute: async (query: string, params?: any[]) => {
        // Simplified query execution for IndexedDB
        console.log('Execute:', query, params);
      },
      query: async <T>(query: string, params?: any[]): Promise<T[]> => {
        // Simplified query for IndexedDB
        console.log('Query:', query, params);
        return [];
      },
      close: async () => {
        // Connection is not closed as it's managed by Database class
      },
    };
  }
}

/**
 * Type-safe table operations
 */
export class Table<T> {
  constructor(
    private schema: TableSchema,
    private database: Database
  ) {}

  /**
   * Insert a record
   */
  async insert(data: T): Promise<Result<T, string>> {
    try {
      const db = this.database.getDB();
      const transaction = db.transaction([this.schema.name], 'readwrite');
      const store = transaction.objectStore(this.schema.name);

      await new Promise((resolve, reject) => {
        const request = store.add(data);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      return { ok: true, value: data };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Find records by criteria
   */
  async find(criteria?: Partial<T>): Promise<T[]> {
    const db = this.database.getDB();
    const transaction = db.transaction([this.schema.name], 'readonly');
    const store = transaction.objectStore(this.schema.name);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        let results = request.result;

        // Filter by criteria
        if (criteria) {
          results = results.filter((item: any) => {
            return Object.entries(criteria).every(([key, value]) => item[key] === value);
          });
        }

        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Find a single record by ID
   */
  async findById(id: any): Promise<T | null> {
    const db = this.database.getDB();
    const transaction = db.transaction([this.schema.name], 'readonly');
    const store = transaction.objectStore(this.schema.name);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update a record
   */
  async update(id: any, data: Partial<T>): Promise<Result<T, string>> {
    try {
      const existing = await this.findById(id);
      if (!existing) {
        return { ok: false, error: 'Record not found' };
      }

      const updated = { ...existing, ...data };
      const db = this.database.getDB();
      const transaction = db.transaction([this.schema.name], 'readwrite');
      const store = transaction.objectStore(this.schema.name);

      await new Promise((resolve, reject) => {
        const request = store.put(updated);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      return { ok: true, value: updated as T };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Delete a record
   */
  async delete(id: any): Promise<Result<void, string>> {
    try {
      const db = this.database.getDB();
      const transaction = db.transaction([this.schema.name], 'readwrite');
      const store = transaction.objectStore(this.schema.name);

      await new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      return { ok: true, value: undefined };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

/**
 * Create a database migration
 */
export function createMigration(
  version: number,
  up: (db: DatabaseConnection) => Promise<void>,
  down?: (db: DatabaseConnection) => Promise<void>
): Migration {
  return { version, up, down };
}

export type { SchemaDefinition, Result } from '@wxtools/core';
