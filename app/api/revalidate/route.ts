import { revalidatePath } from "next/cache"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paths } = body

    if (!paths || !Array.isArray(paths)) {
      return NextResponse.json({ error: "Invalid paths" }, { status: 400 })
    }

    // Revalidate each path
    for (const path of paths) {
      revalidatePath(path)
      console.log(`[v0] 🔄 Revalidated path: ${path}`)
    }

    return NextResponse.json({ revalidated: true, paths })
  } catch (err) {
    console.error("[v0] Revalidation error:", err)
    return NextResponse.json({ error: "Error revalidating" }, { status: 500 })
  }
}
