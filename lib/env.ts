export function env(name: string, required = true): string {
  const v = process.env[name];
  if (!v && required) throw new Error(`Missing env var ${name}`);
  return v ?? '';
}
export const GRAPH_VERSION = () => process.env.GRAPH_VERSION || 'v26.0';
