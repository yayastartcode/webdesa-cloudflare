import { readBody } from "../../validation";
import type { RouteContext } from "../../context";

export function createHandlers({ store }: RouteContext) {

async function POST(request: Request) {
  try {
    const body = await readBody(request, "info");
    const { title, slug, pdfUrl, imageUrl, description, isActive } = body;

    // Validate required fields
    if (!title || !slug || Number(!!pdfUrl) + Number(!!imageUrl) !== 1) {
      return Response.json(
        { error: "Isi judul, link halaman, dan pilih satu lampiran PDF atau gambar" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingInfo = await store.info.findUnique({
      where: { slug },
    });

    if (existingInfo) {
      return Response.json(
        { error: "Slug sudah digunakan" },
        { status: 400 }
      );
    }

    // Create info page
    const info = await store.info.create({
      data: {
        title,
        slug,
        pdfUrl: pdfUrl || '',
        imageUrl: imageUrl || null,
        description: description || null,
        isActive: isActive ?? true,
      },
    });

    return Response.json({
      message: "Halaman info berhasil dibuat",
      info,
    });
  } catch (error) {
    console.error("Error creating info:", error);
    return Response.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const isActive = searchParams.get("isActive");
    const admin = searchParams.get("admin") === "true";

    // Build where clause
    const where: {
      isActive?: boolean;
    } = {};
    if (!admin) where.isActive = true;
    if (admin && isActive !== null) {
      where.isActive = isActive === "true";
    }

    // Get info pages with pagination
    const [infos, total] = await Promise.all([
      store.info.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      store.info.count({ where }),
    ]);

    return Response.json({
      infos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching infos:", error);
    return Response.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
return { POST, GET };
}
