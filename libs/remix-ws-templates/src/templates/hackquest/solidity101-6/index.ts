export default async () => {
  return {
    // @ts-ignore
    'index.sol': (await import('raw-loader!./scripts/index.sol')).default,
  }
}
