import { readBody } from "../../validation";
import type { RouteContext } from "../../context";

export function createHandlers({ store, session }: RouteContext) {

// GET - Fetch APB Desa data
async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin');

    // Admin endpoint - return all APB data
    if (admin === 'true') {


      if (!session || !session.user || session.user.role !== 'ADMIN') {
        return Response.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const allApbData = await store.apbDesa.findMany({
        orderBy: {
          year: 'desc'
        }
      });

      return Response.json({
        success: true,
        data: allApbData
      });
    }

    // Public endpoint - return current/latest active data
    const currentYear = new Date().getFullYear();

    // Try to get current year's data first, fallback to latest available
    let apbData = await store.apbDesa.findFirst({
      where: {
        year: currentYear,
        isActive: true
      }
    });

    // If no data for current year, get the latest available
    if (!apbData) {
      apbData = await store.apbDesa.findFirst({
        where: {
          isActive: true
        },
        orderBy: {
          year: 'desc'
        }
      });
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

// POST - Create new APB Desa data (Admin only)
async function POST(request: Request) {
  try {


    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await readBody(request, "apb-desa");
    const { year, pendapatanDesa, belanjaDesa } = body;

    if (!year || !pendapatanDesa || !belanjaDesa) {
      return Response.json(
        { success: false, error: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    // Check if data for this year already exists
    const existingData = await store.apbDesa.findUnique({
      where: { year: parseInt(year) }
    });

    if (existingData) {
      return Response.json(
        { success: false, error: 'Data APB untuk tahun ini sudah ada' },
        { status: 400 }
      );
    }

    const apbData = await store.apbDesa.create({
      data: {
        year: parseInt(year),
        pendapatanDesa: parseFloat(pendapatanDesa),
        belanjaDesa: parseFloat(belanjaDesa)
      }
    });

    return Response.json({
      success: true,
      data: apbData
    });
  } catch (error) {
    console.error('Error creating APB Desa data:', error);
    return Response.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
return { GET, POST };
}
