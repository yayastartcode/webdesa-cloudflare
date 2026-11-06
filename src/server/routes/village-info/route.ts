import { readBody } from "../../validation";
import type { RouteContext } from "../../context";

export function createHandlers({ store, session }: RouteContext) {

// GET /api/village-info - Get village information
async function GET() {
  try {
    const villageInfo = await store.villageInfo.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return Response.json(villageInfo);
  } catch (error) {
    console.error('Error fetching village info:', error);
    return Response.json(
      { error: 'Gagal mengambil informasi desa' },
      { status: 500 }
    );
  }
}

// POST /api/village-info - Create or update village information
async function POST(request: Request) {
  try {


    if (!session || !session.user || session.user.role !== "ADMIN") {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { visi, misi, tujuan } = await readBody(request, "village-info");

    if (!visi || !misi || !tujuan) {
      return Response.json(
        { error: 'Visi, misi, dan tujuan harus diisi' },
        { status: 400 }
      );
    }

    // Check if village info already exists
    const existingInfo = await store.villageInfo.findFirst();

    let villageInfo;
    if (existingInfo) {
      // Update existing record
      villageInfo = await store.villageInfo.update({
        where: { id: existingInfo.id },
        data: {
          visi,
          misi,
          tujuan,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new record
      villageInfo = await store.villageInfo.create({
        data: {
          visi,
          misi,
          tujuan
        }
      });
    }

    return Response.json(villageInfo);
  } catch (error) {
    console.error('Error creating/updating village info:', error);
    return Response.json(
      { error: 'Gagal menyimpan informasi desa' },
      { status: 500 }
    );
  }
}
return { GET, POST };
}
