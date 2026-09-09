export function InitialAvatar({ name }: { name: string }) {
  return (
    <span aria-hidden="true" className="initial-avatar">
      {name.trim().charAt(0)}
    </span>
  );
}
