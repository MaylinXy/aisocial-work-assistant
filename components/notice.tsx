export function Notice({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;
  return (
    <div className={error ? "notice notice-error" : "notice notice-success"}>
      {error || success}
    </div>
  );
}
