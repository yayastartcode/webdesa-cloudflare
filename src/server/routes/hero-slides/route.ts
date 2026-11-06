import { readBody } from "../../validation";
import type { RouteContext } from "../../context";

export function createHandlers({ store, session }: RouteContext) {

// GET /api/hero-slides
async function GET() {
  try {
    const heroSlides = await store.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });

    return Response.json(heroSlides);
  } catch (error) {
    console.error("Error fetching hero slides:", error);
    return Response.json(
      { error: "Failed to fetch hero slides" },
      { status: 500 }
    );
  }
}

// POST /api/hero-slides
async function POST(request: Request) {
  try {


    if (!session || !session.user || session.user.role !== "ADMIN") {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { title, description, imageUrl, order } = await readBody(request, "hero-slides");

    const heroSlide = await store.heroSlide.create({
      data: {
        title,
        description,
        imageUrl,
        order: order || 1
      }
    });

    return Response.json(heroSlide);
  } catch (error) {
    console.error("Error creating hero slide:", error);
    return Response.json(
      { error: "Failed to create hero slide" },
      { status: 500 }
    );
  }
}
return { GET, POST };
}
