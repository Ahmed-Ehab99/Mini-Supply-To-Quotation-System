interface PgError {
  code?: string;
  message?: string;
  details?: string;
}

export function parseSupabaseError(error: unknown): string {
  const e = error as PgError;
  if (!e) return "Unknown error";
  if (e.code === "23503") return "Cannot delete: this record is in use.";
  if (e.code === "23505") return "A record with this name already exists.";
  if (e.code === "23514") return "Value violates a database constraint.";
  return e.message ?? "Something went wrong";
}
