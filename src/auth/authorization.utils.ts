export const normalizeAuthorizationValue = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();

export const getAdminCargoNames = (rawValue?: string) =>
  (rawValue ?? 'admin,administrador')
    .split(',')
    .map((cargo) => normalizeAuthorizationValue(cargo))
    .filter(Boolean);
