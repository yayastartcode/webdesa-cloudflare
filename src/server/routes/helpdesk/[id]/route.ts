import { readBody } from "../../../validation";
import type { RouteContext } from "../../../context";

export function createHandlers({ store }: RouteContext) {

async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await readBody(request, "helpdesk-update");
    const { status, response } = body;

    // Validate status
    const validStatuses = ["pending", "in_progress", "resolved", "closed"];
    if (status && !validStatuses.includes(status)) {
      return Response.json(
        { error: "Status tidak valid" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: {
      updatedAt: Date;
      status?: string;
      response?: string | null;
    } = {
      updatedAt: new Date(),
    };

    if (status) {
      updateData.status = status;
    }

    if (response !== undefined) {
      updateData.response = response;
    }

    // Update helpdesk entry
    const updatedHelpdesk = await store.helpdesk.update({
      where: { id },
      data: updateData,
    });

    return Response.json({
      message: "Helpdesk berhasil diperbarui",
      helpdesk: updatedHelpdesk,
    });
  } catch (error) {
    console.error("Error updating helpdesk:", error);

    // Check if record not found
    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return Response.json(
        { error: "Helpdesk tidak ditemukan" },
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

    const helpdesk = await store.helpdesk.findUnique({
      where: { id },
    });

    if (!helpdesk) {
      return Response.json(
        { error: "Helpdesk tidak ditemukan" },
        { status: 404 }
      );
    }

    return Response.json({ helpdesk });
  } catch (error) {
    console.error("Error fetching helpdesk:", error);
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

    await store.helpdesk.delete({
      where: { id },
    });

    return Response.json({
      message: "Helpdesk berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting helpdesk:", error);

    // Check if record not found
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      return Response.json(
        { error: "Helpdesk tidak ditemukan" },
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
