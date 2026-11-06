import { readBody } from "../../../../validation";
import type { RouteContext } from "../../../../context";

export function createHandlers({ store, session }: RouteContext) {

// GET /api/info/[id] - Get info by ID
async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const info = await store.info.findUnique({
      where: { id }
    });

    if (!info) {
      return Response.json(
        { success: false, error: 'Halaman info tidak ditemukan' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: info
    });
  } catch (error) {
    console.error('Error fetching info:', error);
    return Response.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// PATCH /api/info/[id] - Update info (Admin only)
async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {


    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { title, slug, pdfUrl, isActive } = await readBody(request, "info-update");

    // Check if info exists
    const existingInfo = await store.info.findUnique({
      where: { id }
    });

    if (!existingInfo) {
      return Response.json(
        { success: false, error: 'Halaman info tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if slug is being changed and if it already exists
    if (slug && slug !== existingInfo.slug) {
      const slugExists = await store.info.findUnique({
        where: { slug }
      });

      if (slugExists) {
        return Response.json(
          { success: false, error: 'Slug sudah digunakan' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: {
      updatedAt: Date;
      title?: string;
      slug?: string;
      pdfUrl?: string;
      isActive?: boolean;
    } = {
      updatedAt: new Date()
    };

    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (pdfUrl !== undefined) updateData.pdfUrl = pdfUrl;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedInfo = await store.info.update({
      where: { id },
      data: updateData
    });

    return Response.json({
      success: true,
      data: updatedInfo,
      message: 'Halaman info berhasil diperbarui'
    });
  } catch (error) {
    console.error('Error updating info:', error);
    return Response.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// DELETE /api/info/[id] - Delete info (Admin only)
async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {


    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if info exists
    const existingInfo = await store.info.findUnique({
      where: { id }
    });

    if (!existingInfo) {
      return Response.json(
        { success: false, error: 'Halaman info tidak ditemukan' },
        { status: 404 }
      );
    }

    await store.info.delete({
      where: { id }
    });

    return Response.json({
      success: true,
      message: 'Halaman info berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting info:', error);
    return Response.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
return { GET, PATCH, DELETE };
}
