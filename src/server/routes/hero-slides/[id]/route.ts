import { readBody } from "../../../validation";
import type { RouteContext } from "../../../context";

export function createHandlers({ store, session }: RouteContext) {

// GET /api/hero-slides/[id]
async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const heroSlide = await store.heroSlide.findUnique({
      where: { id }
    });

    if (!heroSlide) {
      return Response.json(
        { error: "Hero slide not found" },
        { status: 404 }
      );
    }

    return Response.json(heroSlide);
  } catch (error) {
    console.error("Error fetching hero slide:", error);
    return Response.json(
      { error: "Failed to fetch hero slide" },
      { status: 500 }
    );
  }
}

// PATCH /api/hero-slides/[id]
async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;


    if (!session || !session.user || session.user.role !== "ADMIN") {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { title, description, imageUrl, order, isActive } = await readBody(request, "hero-slides-update");

    const heroSlide = await store.heroSlide.update({
      where: { id },
      data: {
        title,
        description,
        imageUrl,
        order,
        isActive
      }
    });

    return Response.json(heroSlide);
  } catch (error) {
    console.error("Error updating hero slide:", error);
    return Response.json(
      { error: "Failed to update hero slide" },
      { status: 500 }
    );
  }
}

// DELETE /api/hero-slides/[id]
async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;


    if (!session || !session.user || session.user.role !== "ADMIN") {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await store.heroSlide.delete({
      where: { id }
    });

    return Response.json({ message: "Hero slide deleted successfully" });
  } catch (error) {
    console.error("Error deleting hero slide:", error);
    return Response.json(
      { error: "Failed to delete hero slide" },
      { status: 500 }
    );
  }
}
return { GET, PATCH, DELETE };
}
