import { connection } from "next/server";
import { ProfileForm } from "@/app/admin/profile/profile-form";
import { prisma } from "@/lib/prisma";

export default async function ProfileAdminPage() {
  await connection();
  const profile = await prisma.profile.findUnique({ where: { id: "primary" } });
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">Portfolio identity</p>
          <h1>Profile</h1>
          <p>Edit the public name, professional focus, contact details and introduction.</p>
        </div>
      </div>
      <ProfileForm
        values={{
          name: profile?.name ?? "Smile Nikoro",
          title: profile?.title ?? "Environmental Engineer & HSE Professional",
          email: profile?.email ?? "smileniko18@gmail.com",
          linkedinUrl: profile?.linkedinUrl ?? "",
          biography: profile?.biography ?? "",
        }}
      />
    </>
  );
}
