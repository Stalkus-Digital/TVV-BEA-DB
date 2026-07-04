interface AuthErrorAlertProps {
  message: string;
}

export function AuthErrorAlert({ message }: AuthErrorAlertProps) {
  return (
    <div
      role="alert"
      className="rounded-md border border-danger/20 bg-danger-bg px-3 py-2 text-sm text-danger"
    >
      {message}
    </div>
  );
}
