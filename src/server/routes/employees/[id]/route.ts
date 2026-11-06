import { readBody } from "../../../validation";
import type { RouteContext } from "../../../context";

export function createHandlers({ store, session }: RouteContext) {

async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const employee = await store.employee.findUnique({
      where: { id }
    });

    if (!employee) {
      return Response.json(
        { success: false, error: "Employee not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error("Error fetching employee:", error);
    return Response.json(
      { success: false, error: "Failed to fetch employee" },
      { status: 500 }
    );
  }
}

async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    // Get current employee
    const currentEmployee = await store.employee.findUnique({
      where: { id }
    });

    if (!currentEmployee) {
      return Response.json(
        { success: false, error: "Employee not found" },
        { status: 404 }
      );
    }

    // If order is changing, handle reordering
    if (currentEmployee.order !== order) {
      const existingEmployee = await store.employee.findFirst({
        where: {
          order,
          isActive: true,
          id: { not: id }
        }
      });

      if (existingEmployee) {
        // Shift other employees' order
        if (order > currentEmployee.order) {
          // Moving down - shift up employees between old and new position
          await store.employee.updateMany({
            where: {
              order: { gt: currentEmployee.order, lte: order },
              isActive: true,
              id: { not: id }
            },
            data: {
              order: { decrement: 1 }
            }
          });
        } else {
          // Moving up - shift down employees between new and old position
          await store.employee.updateMany({
            where: {
              order: { gte: order, lt: currentEmployee.order },
              isActive: true,
              id: { not: id }
            },
            data: {
              order: { increment: 1 }
            }
          });
        }
      }
    }

    const employee = await store.employee.update({
      where: { id },
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
    console.error("Error updating employee:", error);
    return Response.json(
      { success: false, error: "Failed to update employee" },
      { status: 500 }
    );
  }
}

async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {


    if (!session || !session.user || session.user.role !== "ADMIN") {
      return Response.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Get current employee to know its order
    const currentEmployee = await store.employee.findUnique({
      where: { id }
    });

    if (!currentEmployee) {
      return Response.json(
        { success: false, error: "Employee not found" },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    await store.employee.update({
      where: { id },
      data: { isActive: false }
    });

    // Shift remaining employees' order to fill the gap
    await store.employee.updateMany({
      where: {
        order: { gt: currentEmployee.order },
        isActive: true
      },
      data: {
        order: { decrement: 1 }
      }
    });

    return Response.json({
      success: true,
      message: "Employee deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return Response.json(
      { success: false, error: "Failed to delete employee" },
      { status: 500 }
    );
  }
}
return { GET, PUT, DELETE };
}
