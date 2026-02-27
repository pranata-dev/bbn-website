import AdminClientLayout from "./AdminClientLayout"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Authentication is handled securely at the middleware level (src/proxy.ts)
    // via JWT verification.
    return <AdminClientLayout>{children}</AdminClientLayout>
}
