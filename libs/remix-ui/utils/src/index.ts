export * from './lib/should-render'

export enum HqValidationCommand {
  retrieve = 'retrieve',
  assert = 'assert',
}
export type HqValidationFunction = {
  type: HqValidationCommand;
  args: Record<string, string>;
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function trimValue(value: string = '') {
  return (value || '').trim().replace(/^(['"])(.*)\1$/, '$2');
}

export function parseValidationScript(script: string): HqValidationFunction[] {
  const lines = script.split('\n');
  const result: HqValidationFunction[] = [];
  for (let line of lines) {
    line = line.trim().replace(/;$/, '');
    if (!line || line.startsWith('//')) continue;

    // for `retrieve`
    if (line.includes('retrieve()')) {
      const item = {
        type: HqValidationCommand.retrieve,
        args: {},
      };
      const match = line.match(/^(?:let|const)\s+\(\s*([^)]+)\s*\)/);
      if (match) {
        const variables = match[1].split(',')
          .map(v => v.trim())
          .filter(Boolean);
        for (const variable of variables) {
          const [key, value] = variable.split('=');
          item.args[key] = trimValue(value);
        }
      }
      result.push(item);
      continue;
    }

    // for `console.assert`
    if (line.startsWith('console.assert(')) {
      const item = {
        type: HqValidationCommand.assert,
        args: {} as Record<string, string>,
      };
      const assert = line.slice('console.assert('.length, -1);
      const [exp, message] = assert.split(',');
      const [key, value] = exp.split('===');
      item.args.key = key.trim();
      item.args.value = trimValue(value);
      item.args.message = trimValue(message);
      result.push(item);
      continue;
    }

    throw new Error(`Unknown validation script: ${line}`);
  }
  return result;
}
