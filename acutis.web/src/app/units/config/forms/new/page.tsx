import FormDesigner from "@/areas/config/FormDesigner";

type ConfigFormsNewPageProps = {
  searchParams?: Promise<{ formType?: string }>;
};

export default async function ConfigFormsNewPage({ searchParams }: ConfigFormsNewPageProps) {
  const params = await searchParams;
  const initialFormType = params?.formType === "screening" ? "screening" : "admission";

  return <FormDesigner initialFormType={initialFormType} />;
}
