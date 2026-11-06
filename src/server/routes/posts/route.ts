import { readBody } from "../../validation";
import type { RouteContext } from "../../context";

export function createHandlers({ store, session }: RouteContext) {

// GET /api/posts - Get all published posts
async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const posts = await store.post.findMany({
      where: {
        published: true
      },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    const totalPosts = await store.post.count({
      where: {
        published: true
      }
    });

    return Response.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total: totalPosts,
        totalPages: Math.ceil(totalPosts / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return Response.json(
      { success: false, error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post
async function POST(request: Request) {
  try {


    if (!session || !session.user || session.user.role !== "ADMIN") {
      return Response.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const { title, content, imageUrl, published } = await readBody(request, "posts");

    if (!title || !content) {
      return Response.json(
        { success: false, error: "Title and content are required" },
        { status: 400 }
      );
    }

    const post = await store.post.create({
      data: {
        title,
        content,
        imageUrl,
        published: published || false,
        authorId: session.user.id
      },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return Response.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return Response.json(
      { success: false, error: "Failed to create post" },
      { status: 500 }
    );
  }
}
return { GET, POST };
}
