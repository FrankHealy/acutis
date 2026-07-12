import FormHistory from "@/areas/config/FormHistory";

type FormHistoryPageProps = {
  searchParams?: Promise<{ formCode?: string }>;
};

export default async function FormHistoryPage({ searchParams }: FormHistoryPageProps) {
  const params = await searchParams;

  return <FormHistory formCode={params?.formCode ?? ""} />;
}
