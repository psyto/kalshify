import { redirect } from "next/navigation";

export default function ToolsPage() {
    // Tools have been merged into the Learn tab
    redirect("/?tab=learn&subtab=compare");
}
