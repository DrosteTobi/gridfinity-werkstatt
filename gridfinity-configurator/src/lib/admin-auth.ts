export function getAdminToken(): string {
  return process.env.ADMIN_TOKEN?.trim() || "local-dev-admin";
}

export function isValidAdminToken(token: string | null | undefined): boolean {
  if (!token) return false;
  return token === getAdminToken();
}
