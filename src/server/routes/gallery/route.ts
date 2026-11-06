import { readBody } from "../../validation";
import type { RouteContext } from "../../context";

export function createHandlers({ store }: RouteContext) {

async function POST(request: Request) {
  try {
    const body = await readBody(request, "gallery");
    const { title, description, imageUrl, category, order } = body;

    // Validate required fields
    if (!title || !imageUrl) {
      return Response.json(
        { error: "Title dan URL gambar wajib diisi" },
        { status: 400 }
      );
    }

    // Create gallery item
    const gallery = await store.gallery.create({
      data: {
        title,
        description,
        imageUrl,
        category,
        order: order || 0,
      },
    });

    return Response.json({
      message: "Item galeri berhasil dibuat",
      gallery,
    });
  } catch (error) {
    console.error("Error creating gallery item:", error);
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
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const isActive = searchParams.get("isActive");

    // Build where clause
    const where: {
      category?: string;
      isActive?: boolean;
    } = {};
    if (category) {
      where.category = category;
    }
    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    // Get gallery items with pagination
    const [galleries, total] = await Promise.all([
      store.gallery.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      store.gallery.count({ where }),
    ]);

    // Get unique categories for filtering
    const categories = await store.gallery.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ["category"],
    });

    const uniqueCategories = categories
      .map((item: { category: string | null }) => item.category)
      .filter(Boolean)
      .sort();

    return Response.json({
      galleries,
      categories: uniqueCategories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching gallery items:", error);
    return Response.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
return { POST, GET };
}
