import { readBody } from "../../validation";
import type { RouteContext } from "../../context";

export function createHandlers({ store, session }: RouteContext) {

// GET /api/header-settings
async function GET() {
  try {
    const headerSettings = await store.headerSettings.findFirst({
      include: {
        navigationItems: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        }
      }
    });

    return Response.json(headerSettings);
  } catch (error) {
    console.error("Error fetching header settings:", error);
    return Response.json(
      { error: "Failed to fetch header settings" },
      { status: 500 }
    );
  }
}

// POST /api/header-settings
async function POST(request: Request) {
  try {


    if (!session || !session.user || session.user.role !== "ADMIN") {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { logoUrl, navigationItems } = await readBody(request, "header-settings");

    // Check if header settings already exist
    let headerSettings = await store.headerSettings.findFirst();

    if (headerSettings) {
      // Update existing settings
      headerSettings = await store.headerSettings.update({
        where: { id: headerSettings.id },
        data: { logoUrl },
        include: {
          navigationItems: {
            orderBy: { order: 'asc' }
          }
        }
      });
    } else {
      // Create new settings
      headerSettings = await store.headerSettings.create({
        data: { logoUrl },
        include: {
          navigationItems: {
            orderBy: { order: 'asc' }
          }
        }
      });
    }

    // Update navigation items if provided
    if (navigationItems && Array.isArray(navigationItems) && headerSettings) {
      // Delete existing navigation items
      await store.navigationItem.deleteMany({
        where: { headerSettingsId: headerSettings.id }
      });

      // Create new navigation items
      if (navigationItems.length > 0) {
        await store.navigationItem.createMany({
          data: navigationItems.map((item: {
            label: string;
            href: string;
            order?: number;
            isActive?: boolean;
          }, index: number) => ({
            label: item.label,
            href: item.href,
            order: item.order || index + 1,
            isActive: item.isActive !== false,
            headerSettingsId: headerSettings!.id
          }))
        });
      }

      // Fetch updated settings with navigation items
      const updatedSettings = await store.headerSettings.findUnique({
        where: { id: headerSettings.id },
        include: {
          navigationItems: {
            where: { isActive: true },
            orderBy: { order: 'asc' }
          }
        }
      });

      if (updatedSettings) {
        headerSettings = updatedSettings;
      }
    }

    return Response.json(headerSettings);
  } catch (error) {
    console.error("Error updating header settings:", error);
    return Response.json(
      { error: "Failed to update header settings" },
      { status: 500 }
    );
  }
}
return { GET, POST };
}
