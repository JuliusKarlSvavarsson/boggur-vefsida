import Image from "next/image";

type TeamCardProps = {
  name: string;
  role: string;
  imageSrc?: string;
  phone?: string | null;
  email?: string | null;
};

export default function TeamCard({ name, role, imageSrc, phone, email }: TeamCardProps) {
  const initials = name
    .split(" ")
    .filter((part) => part.trim().length > 0)
    .slice(0, 2)
    .map((part) => part.trim().charAt(0).toUpperCase())
    .join("");

  return (
    <article className="h-full overflow-hidden rounded-md border border-slate-200/70 bg-[#fdfcf8] text-sm text-slate-700 shadow-sm transition-transform transition-shadow duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-64 w-full bg-slate-100">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={name}
            width={800}
            height={600}
            className="h-full w-full object-cover object-[50%_25%]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-base font-semibold tracking-[0.18em] text-slate-500">
            {initials || "B"}
          </div>
        )}
      </div>
      <div className="px-3.5 py-3.5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{name}</h2>
          {role && (
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              {role}
            </p>
          )}
        </div>
        {(phone || email) && (
          <div className="mt-2 space-y-1 text-xs text-slate-600">
            {phone && (
              <a
                href={`tel:${phone}`}
                className="block hover:text-slate-900"
              >
                {phone}
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="block break-all hover:text-slate-900"
              >
                {email}
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
