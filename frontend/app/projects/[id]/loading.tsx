export default function Loading() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading project">
      <div className="skeleton h-28 w-full" />
      <div className="skeleton h-72 w-full" />
    </div>
  );
}
