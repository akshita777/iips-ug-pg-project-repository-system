export function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelative(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(value);
}

export const MAX_UPLOAD_MB = 50;

export function validateUpload(file: File | null): string | null {
  if (!file) return "Pick a file first.";
  if (file.size === 0) return "File is empty.";
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    return `File is too large. Max ${MAX_UPLOAD_MB} MB.`;
  }
  const name = file.name.toLowerCase();
  const allowed = [".zip", ".pdf", ".pptx", ".ppt", ".docx", ".doc", ".tar", ".gz"];
  if (!allowed.some((ext) => name.endsWith(ext))) {
    return `Unsupported type. Allowed: ${allowed.join(", ")}`;
  }
  return null;
}
