import Image from "next/image";

export function InitialAvatar({
  name,
  pictureUrl,
}: {
  name: string;
  pictureUrl?: string | null;
}) {
  return (
    <span className="initial-avatar">
      {pictureUrl ? (
        <Image
          src={pictureUrl}
          alt={`รูปโปรไฟล์ของ ${name}`}
          width={48}
          height={48}
          unoptimized
        />
      ) : (
        <span aria-hidden="true">{name.trim().charAt(0)}</span>
      )}
    </span>
  );
}
