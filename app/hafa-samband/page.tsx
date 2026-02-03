import { ContactHero } from "./ContactHero";
import { ContactInfo } from "./ContactInfo";
import { ContactForm } from "./ContactForm";
import { ContactMap } from "./ContactMap";

export default function HafaSambandPage() {
  return (
    <div
      className="flex flex-col"
      style={{ paddingTop: "calc(var(--header-height) + 1rem)" }}
    >
      <ContactHero />
      <ContactInfo>
        <ContactForm />
      </ContactInfo>
      <ContactMap />
    </div>
  );
}
