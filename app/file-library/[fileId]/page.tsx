import FilePreviewClient from "@/components/file-library/file-preview-client"

export default async function FileDetailPage({ params }: { params: Promise<{ fileId: string }> }) {
  const resolvedParams = await params
  const fileId = resolvedParams?.fileId

  console.log("[v0] FileDetailPage params:", { resolvedParams, fileId })

  if (!fileId) {
    return <div className="flex items-center justify-center h-screen text-red-500">Invalid file ID</div>
  }

  return <FilePreviewClient fileId={fileId} />
}
