export const execSync = () => {
  throw new Error("Not available in browser");
};
export const join = (...args: string[]) => args.join("/");
export const resolve = (...args: string[]) => args.join("/");
export const existsSync = () => false;
export const readFileSync = () => "";
export const writeFileSync = () => {};
export const mkdirSync = () => {};
export class EventEmitter {
  on() {
    return this;
  }
  off() {
    return this;
  }
  emit() {
    return false;
  }
  once() {
    return this;
  }
  removeListener() {
    return this;
  }
  removeAllListeners() {
    return this;
  }
}

// Minimal http stubs so express can import without throwing
export class IncomingMessage extends EventEmitter {
  headers: Record<string, string> = {};
  method = "";
  url = "";
}
export class ServerResponse extends EventEmitter {
  statusCode = 200;
  setHeader() {}
  getHeader() {
    return undefined;
  }
  end() {}
  write() {}
}
export const createServer = () => ({ listen: () => {}, close: () => {} });
export const STATUS_CODES: Record<number, string> = {};
export const isIP = () => 0;
export const isIPv4 = () => false;
export const isIPv6 = () => false;

// util stubs
export const deprecate = (fn: Function) => fn;
export const inherits = () => {};
export const promisify = (fn: Function) => fn;
export const inspect = (v: unknown) => String(v);
// os stubs
export const hostname = () => "localhost";
export const platform = () => "browser";
// stream stubs
export class Readable extends EventEmitter {}
export class Writable extends EventEmitter {}
export class Transform extends EventEmitter {}
// crypto stubs
export const randomBytes = (n: number) => new Uint8Array(n);
export const createHash = () => ({ update: () => ({ digest: () => "" }) });
// async_hooks stubs
export class AsyncLocalStorage {
  run(_store: unknown, fn: Function) {
    return fn();
  }
  getStore() {
    return undefined;
  }
}

export default {
  execSync,
  join,
  resolve,
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  EventEmitter,
  IncomingMessage,
  ServerResponse,
  createServer,
  STATUS_CODES,
  isIP,
  isIPv4,
  isIPv6,
  deprecate,
  inherits,
  promisify,
  inspect,
  hostname,
  platform,
  Readable,
  Writable,
  Transform,
  randomBytes,
  createHash,
  AsyncLocalStorage,
};
