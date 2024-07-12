export * from './lib/should-render'

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
