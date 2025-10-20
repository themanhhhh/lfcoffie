export function generateId(prefix: string): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
}

export function generatePhieuThuId(): string {
  return generateId('PT');
}

export function generatePhieuChiId(): string {
  return generateId('PC');
}

export function generateChiTietPhieuThuId(): string {
  return generateId('CTPT');
}

export function generateChiTietPhieuChiId(): string {
  return generateId('CTPC');
}

