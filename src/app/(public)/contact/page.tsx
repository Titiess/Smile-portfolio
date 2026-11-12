import type { Metadata } from "next";
import { ArrowUpRight, Link2, Mail } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { getPublicProfile } from "@/lib/public-data";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Smile Nikoro about environmental engineering, HSE and professional opportunities.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const profile = await getPublicProfile();
  return (
    <>
      <PageHeading
        description="For professional opportunities, thoughtful collaboration or a conversation about environmental engineering and HSE."
        eyebrow="Contact"
        title="Good work begins with a thoughtful conversation."
      />
      <div className="page-content">
        <div className="contact-grid">
          <a className="contact-card" href={`mailto:${profile.email}`}>
            <Mail aria-hidden="true" size={20} />
            <div>
              <span>Email</span>
              <strong>{profile.email}</strong>
            </div>
          </a>
          <a
            className="contact-card"
            href={profile.linkedin}
            rel="noreferrer"
            target="_blank"
          >
            <Link2 aria-hidden="true" size={20} />
            <div>
              <span>LinkedIn</span>
              <strong>
                Connect professionally <ArrowUpRight aria-hidden="true" size={14} />
              </strong>
            </div>
          </a>
        </div>
        <div className="contact-form-section">
          <h2 className="contact-form-heading">Send a message</h2>
          <p className="contact-form-intro">
            Your message is sent privately and is visible only in the administrator dashboard.
          </p>
          <ContactForm email={profile.email} />
        </div>
      </div>
    </>
  );
}
