import type { RouteContext } from "../../../context";

export function createHandlers({ store }: RouteContext) {

async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const info = await store.info.findUnique({
      where: { slug },
    });

    if (!info) {
      return Response.json(
        { success: false, error: "Halaman info tidak ditemukan" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: info
    });
  } catch (error) {
    console.error("Error fetching info:", error);
    return Response.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
return { GET };
}
