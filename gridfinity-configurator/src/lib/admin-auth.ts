/** Admin gate — requires ADMIN_TOKEN in the environment; no shipped default. */
export function getAdminToken(): string | null {
  const token = process.env.ADMIN_TOKEN?.trim();
  return token ? token : null;
}

export function isValidAdminToken(token: string | null | undefined): boolean {
  const expected = getAdminToken();
  if (!expected || !token) return false;
  return token === expected;
}
