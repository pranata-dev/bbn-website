import { redirect } from "next/navigation"

export default async function MateriRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const course = typeof params?.course === "string" ? params.course : ""
  redirect(`/dashboard/materi${course ? `?course=${encodeURIComponent(course)}` : ""}`)
}
