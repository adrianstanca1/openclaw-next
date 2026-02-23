export const execSync = () => { throw new Error('Not available in browser'); };
export const join = (...args: string[]) => args.join('/');
export const resolve = (...args: string[]) => args.join('/');
export const existsSync = () => false;
export const readFileSync = () => '';
export const writeFileSync = () => {};
export const mkdirSync = () => {};
export class EventEmitter {
  on() { return this; }
  off() { return this; }
  emit() { return false; }
  once() { return this; }
}
export default {
  execSync,
  join,
  resolve,
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  EventEmitter
};
