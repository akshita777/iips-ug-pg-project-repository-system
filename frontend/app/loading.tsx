export default function Loading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      <div className="skeleton h-40 w-full" />
      <div className="grid gap-5 md:grid-cols-3">
        <div className="skeleton h-32 w-full" />
        <div className="skeleton h-32 w-full" />
        <div className="skeleton h-32 w-full" />
      </div>
    </div>
  );
}
