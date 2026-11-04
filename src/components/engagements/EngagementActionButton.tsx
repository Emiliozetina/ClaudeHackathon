/** A one-button form that posts the engagement id to a server action. */
export function EngagementActionButton({
  engagementId,
  action,
  children,
}: {
  engagementId: string;
  action: (formData: FormData) => Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="engagementId" value={engagementId} />
      <button
        type="submit"
        className="rounded bg-black px-3 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-black"
      >
        {children}
      </button>
    </form>
  );
}
