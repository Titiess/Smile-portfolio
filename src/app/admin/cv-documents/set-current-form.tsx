import { setCurrentCv } from "@/app/admin/actions";

export function SetCurrentCvForm({ id }: { id: string }) {
  return (
    <form action={setCurrentCv}>
      <input name="id" type="hidden" value={id} />
      <button className="admin-button" type="submit">Make current</button>
    </form>
  );
}
