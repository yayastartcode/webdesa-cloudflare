import type { RouteContext } from "../../../context";

export function createHandlers({ store }: RouteContext) {

async function GET() {
  try {
    const adminUser = await store.user.findFirst({
      where: {
        role: "ADMIN"
      }
    });

    return Response.json({
      exists: !!adminUser
    });
  } catch (error) {
    console.error("Error checking admin:", error);
    return Response.json(
      { error: "Gagal memeriksa admin" },
      { status: 500 }
    );
  }
}
return { GET };
}
