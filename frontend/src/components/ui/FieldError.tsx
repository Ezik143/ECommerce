import type { FieldErrors, FieldValues, Path } from 'react-hook-form';

interface FieldErrorProps<T extends FieldValues> {
  name: Path<T>;
  errors: FieldErrors<T>;
}

export const FieldError = <T extends FieldValues>({ name, errors }: FieldErrorProps<T>) => {
  const error = errors[name];
  if (!error?.message) return null;

  return (
    <span role="alert" style={{ color: 'var(--error)', fontSize: 'var(--text-caption)', marginTop: '0.25rem', display: 'block' }}>
      {String(error.message)}
    </span>
  );
};
