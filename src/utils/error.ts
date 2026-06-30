export function getErrorMessage(err: unknown, fallback = '操作失败'): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return fallback;
}
