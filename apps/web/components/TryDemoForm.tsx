// A plain form post, so the guest sign-in works without client JavaScript and
// the server can set the session cookie on its redirect.
export function TryDemoForm({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <form method="post" action="/api/demo/sign-in" className={className}>
      {children}
    </form>
  );
}
