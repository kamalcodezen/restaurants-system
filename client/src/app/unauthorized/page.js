import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base-200 px-4 text-center">
      <div className="max-w-md">
        <h1 className="text-9xl font-bold text-error">403</h1>
        <h2 className="mt-4 text-3xl font-semibold text-base-content">Access Denied</h2>
        <p className="mt-2 text-base-content/70">
          You do not have permissions to access this page.
        </p>
        <div className="mt-6">
          <Link href="/login" className="btn btn-primary">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
