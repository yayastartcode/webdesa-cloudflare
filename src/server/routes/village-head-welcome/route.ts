import { readBody } from "../../validation";
import type { RouteContext } from "../../context";

export function createHandlers({ store, session }: RouteContext) {

async function GET() {
  try {
    const welcome = await store.villageHeadWelcome.findFirst({
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }, { id: 'asc' }]
    });

    return Response.json({
      success: true,
      data: welcome || { content: "" }
    });
  } catch (error) {
    console.error("Error fetching village head welcome:", error);
    return Response.json(
      { success: false, error: "Failed to fetch village head welcome" },
      { status: 500 }
    );
  }
}

async function POST(request: Request) {
  try {


    if (!session || !session.user || session.user.role !== "ADMIN") {
      return Response.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const { content } = await readBody(request, "village-head-welcome");

    if (!content || typeof content !== "string") {
      return Response.json(
        { success: false, error: "Content is required" },
        { status: 400 }
      );
    }

    // Check if welcome message already exists
    const existingWelcome = await store.villageHeadWelcome.findFirst({ orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }, { id: 'asc' }] });

    let welcome;
    if (existingWelcome) {
      // Update existing welcome message
      welcome = await store.villageHeadWelcome.update({
        where: { id: existingWelcome.id },
        data: { content }
      });
    } else {
      // Create new welcome message
      welcome = await store.villageHeadWelcome.create({
        data: { content }
      });
    }

    return Response.json({
      success: true,
      data: welcome
    });
  } catch (error) {
    console.error("Error saving village head welcome:", error);
    return Response.json(
      { success: false, error: "Failed to save village head welcome" },
      { status: 500 }
    );
  }
}
return { GET, POST };
}
