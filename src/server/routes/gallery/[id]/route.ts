import { readBody } from "../../../validation";
import type { RouteContext } from "../../../context";

export function createHandlers({ store }: RouteContext) {

async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await readBody(request, "gallery-update");
    const { title, description, imageUrl, category, order, isActive } = body;

    // Prepare update data
    const updateData: {
      title?: string;
      description?: string | null;
      imageUrl?: string;
      category?: string | null;
      order?: number;
      isActive?: boolean;
    } = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (category !== undefined) updateData.category = category;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update gallery item
    const updatedGallery = await store.gallery.update({
      where: { id },
      data: updateData,
    });

    return Response.json({
      message: "Item galeri berhasil diperbarui",
      gallery: updatedGallery,
    });
  } catch (error) {
    console.error("Error updating gallery item:", error);
    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return Response.json(
        { error: "Item galeri tidak ditemukan" },
        { status: 404 }
      );
    }
    return Response.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const gallery = await store.gallery.findUnique({
      where: { id },
    });

    if (!gallery) {
      return Response.json(
        { error: "Item galeri tidak ditemukan" },
        { status: 404 }
      );
    }

    return Response.json({ gallery });
  } catch (error) {
    console.error("Error fetching gallery item:", error);
    return Response.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await store.gallery.delete({
      where: { id },
    });

    return Response.json({
      message: "Item galeri berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      return Response.json(
        { error: "Item galeri tidak ditemukan" },
        { status: 404 }
      );
    }
    return Response.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
return { PATCH, GET, DELETE };
}
