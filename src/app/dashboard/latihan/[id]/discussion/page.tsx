import { AssessmentDiscussionView } from "@/components/assessment/AssessmentDiscussionView"

export const dynamic = "force-dynamic"

export default async function LatihanDiscussionPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    return <AssessmentDiscussionView tryoutId={id} mode="latihan" />
}
