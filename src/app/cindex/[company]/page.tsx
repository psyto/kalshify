import { redirect } from "next/navigation";

interface PageProps {
    params: Promise<{ company: string }>;
}

export default async function CindexCompanyPage({ params }: PageProps) {
    const { company } = await params;
    redirect(`/curate/protocol/${company}`);
}
