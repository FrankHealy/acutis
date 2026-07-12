import { redirect } from "next/navigation";

export default function ConfigScreeningFormPage() {
  redirect("/units/config/forms/new?formType=screening");
}
