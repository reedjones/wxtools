import type { Result } from '@wxtools/core';

/**
 * RPC method definition
 */
export interface RPCMethod<TInput = any, TOutput = any> {
  name: string;
  handler: (input: TInput) => Promise<TOutput> | TOutput;
  validate?: (input: TInput) => Result<TInput, string>;
}

/**
 * RPC context for handlers
 */
export interface RPCContext {
  /** Sender information (for browser extension messages) */
  sender?: chrome.runtime.MessageSender;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * RPC server for handling method calls
 */
export class RPCServer {
  private methods = new Map<string, RPCMethod>();

  /**
   * Register an RPC method
   */
  register<TInput, TOutput>(method: RPCMethod<TInput, TOutput>): void {
    if (this.methods.has(method.name)) {
      throw new Error(`RPC method ${method.name} is already registered`);
    }
    this.methods.set(method.name, method);
  }

  /**
   * Call an RPC method
   */
  async call<TInput, TOutput>(
    name: string,
    input: TInput,
    context?: RPCContext
  ): Promise<Result<TOutput, string>> {
    const method = this.methods.get(name);

    if (!method) {
      return { ok: false, error: `RPC method ${name} not found` };
    }

    // Validate input
    if (method.validate) {
      const validationResult = method.validate(input);
      if (!validationResult.ok) {
        return validationResult as Result<TOutput, string>;
      }
    }

    try {
      const result = await method.handler(input);
      return { ok: true, value: result as TOutput };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Set up browser extension message listener
   */
  listen(): void {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'rpc-call') {
          const context: RPCContext = { sender };
          this.call(message.method, message.input, context).then(sendResponse);
          return true; // Keep channel open for async response
        }
      });
    }
  }

  /**
   * Get all registered method names
   */
  getMethods(): string[] {
    return Array.from(this.methods.keys());
  }
}

/**
 * RPC client for making method calls
 */
export class RPCClient {
  /**
   * Call an RPC method
   */
  async call<TInput, TOutput>(
    method: string,
    input: TInput
  ): Promise<Result<TOutput, string>> {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      // Browser extension context
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { type: 'rpc-call', method, input },
          (response: Result<TOutput, string>) => {
            resolve(response);
          }
        );
      });
    }

    // Fallback for non-extension context
    return { ok: false, error: 'RPC not available in this context' };
  }

  /**
   * Create a typed method caller
   */
  createMethod<TInput, TOutput>(name: string) {
    return (input: TInput): Promise<Result<TOutput, string>> => {
      return this.call<TInput, TOutput>(name, input);
    };
  }
}

/**
 * Type-safe RPC method builder
 */
export function defineRPCMethod<TInput, TOutput>(
  name: string,
  handler: (input: TInput, context?: RPCContext) => Promise<TOutput> | TOutput,
  validate?: (input: TInput) => Result<TInput, string>
): RPCMethod<TInput, TOutput> {
  return { name, handler, validate };
}

/**
 * Decorator for class-based RPC methods
 */
export function RPCMethod(name?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const methodName = name || propertyKey;
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      return originalMethod.apply(this, args);
    };

    // Store metadata for method registration
    if (!target.constructor._rpcMethods) {
      target.constructor._rpcMethods = [];
    }
    target.constructor._rpcMethods.push({
      name: methodName,
      handler: descriptor.value,
    });

    return descriptor;
  };
}

export type { Result } from '@wxtools/core';
