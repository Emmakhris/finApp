export function formatGHS(pesewas: number): string {
  return `GHS ${(pesewas / 100).toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function toStorageAmount(value: string | number): number {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(n)) return 0;
  return Math.round(n * 100);
}

export function fromStorageAmount(pesewas: number): string {
  return (pesewas / 100).toFixed(2);
}
