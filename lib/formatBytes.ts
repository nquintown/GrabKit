export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 o'
  const k = 1024
  const d = Math.max(0, decimals)
  const sizes = ['o', 'Ko', 'Mo', 'Go', 'To']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(d))} ${sizes[i]}`
}
