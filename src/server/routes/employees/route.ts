import { readBody } from "../../validation";
import type { RouteContext } from "../../context";

export function createHandlers({ store, session }: RouteContext) {

async function GET() {
  try {
    const employees = await store.employee.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        order: 'asc'
      }
    });

    return Response.json({
      success: true,
      data: employees
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return Response.json(
      { success: false, error: "Failed to fetch employees" },
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

    const { name, position, photoUrl, order } = await readBody(request, "employees");

    if (!name || !position || order === undefined) {
      return Response.json(
        { success: false, error: "Name, position, and order are required" },
        { status: 400 }
      );
    }

    // Check if order already exists and adjust if needed
    const existingEmployee = await store.employee.findFirst({
      where: { order, isActive: true }
    });

    if (existingEmployee) {
      // Shift other employees' order
      await store.employee.updateMany({
        where: {
          order: { gte: order },
          isActive: true
        },
        data: {
          order: { increment: 1 }
        }
      });
    }

    const employee = await store.employee.create({
      data: {
        name,
        position,
        photoUrl,
        order
      }
    });

    return Response.json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    return Response.json(
      { success: false, error: "Failed to create employee" },
      { status: 500 }
    );
  }
}
return { GET, POST };
}
