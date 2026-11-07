import { readBody } from "../../../validation";
import type { RouteContext } from "../../../context";

export function createHandlers({ store, session }: RouteContext) {

// GET /api/posts/[id] - Get a specific post
async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const post = await store.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!post || (!post.published && session?.user.role !== 'ADMIN')) {
      return Response.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return Response.json(
      { success: false, error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[id] - Update a post
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

    const { title, content, imageUrl, published } = await readBody(request, "posts");

    if (!title || !content) {
      return Response.json(
        { success: false, error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Check if post exists
    const existingPost = await store.post.findUnique({
      where: { id }
    });

    if (!existingPost) {
      return Response.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    const post = await store.post.update({
      where: { id },
      data: {
        title,
        content,
        imageUrl,
        published: published !== undefined ? published : existingPost.published
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
    console.error("Error updating post:", error);
    return Response.json(
      { success: false, error: "Failed to update post" },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - Delete a post
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

    // Check if post exists
    const existingPost = await store.post.findUnique({
      where: { id }
    });

    if (!existingPost) {
      return Response.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    await store.post.delete({
      where: { id }
    });

    return Response.json({
      success: true,
      message: "Post deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return Response.json(
      { success: false, error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
return { GET, PUT, DELETE };
}
