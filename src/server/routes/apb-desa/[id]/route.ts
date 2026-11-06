import { readBody } from "../../../validation";
import type { RouteContext } from "../../../context";

export function createHandlers({ store, session }: RouteContext) {

// GET - Fetch specific APB Desa data by ID
async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const apbData = await store.apbDesa.findUnique({
      where: { id }
    });

    if (!apbData) {
      return Response.json(
        { success: false, error: 'Data APB Desa tidak ditemukan' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: apbData
    });
  } catch (error) {
    console.error('Error fetching APB Desa data:', error);
    return Response.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// PUT - Update APB Desa data (Admin only)
async function PUT(
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
    const body = await readBody(request, "apb-desa");
    const { year, pendapatanDesa, belanjaDesa, isActive } = body;

    // Check if APB data exists
    const existingData = await store.apbDesa.findUnique({
      where: { id }
    });

    if (!existingData) {
      return Response.json(
        { success: false, error: 'Data APB Desa tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if year is being changed and conflicts with existing data
    if (year && parseInt(year) !== existingData.year) {
      const yearConflict = await store.apbDesa.findFirst({
        where: {
          year: parseInt(year),
          id: { not: id }
        }
      });

      if (yearConflict) {
        return Response.json(
          { success: false, error: 'Data APB untuk tahun ini sudah ada' },
          { status: 400 }
        );
      }
    }

    const updateData: {
      year?: number;
      pendapatanDesa?: number;
      belanjaDesa?: number;
      isActive?: boolean;
    } = {};
    if (year !== undefined) updateData.year = parseInt(year);
    if (pendapatanDesa !== undefined) updateData.pendapatanDesa = parseFloat(pendapatanDesa);
    if (belanjaDesa !== undefined) updateData.belanjaDesa = parseFloat(belanjaDesa);
    if (isActive !== undefined) updateData.isActive = isActive;

    const apbData = await store.apbDesa.update({
      where: { id },
      data: updateData
    });

    return Response.json({
      success: true,
      data: apbData
    });
  } catch (error) {
    console.error('Error updating APB Desa data:', error);
    return Response.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// DELETE - Delete APB Desa data (Admin only)
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

    // Check if APB data exists
    const existingData = await store.apbDesa.findUnique({
      where: { id }
    });

    if (!existingData) {
      return Response.json(
        { success: false, error: 'Data APB Desa tidak ditemukan' },
        { status: 404 }
      );
    }

    await store.apbDesa.delete({
      where: { id }
    });

    return Response.json({
      success: true,
      message: 'Data APB Desa berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting APB Desa data:', error);
    return Response.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
return { GET, PUT, DELETE };
}
