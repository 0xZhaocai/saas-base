// app/routes/api.blog.tsx
// Blog API - CRUD operations for posts

import { data, type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
import { getDb } from "@/db";
import { post } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { createAuth } from "@/lib/auth.server";
import { z } from "zod";

// Validation schema
const postSchema = z.object({
    title: z.string().min(1, "Title is required").max(100),
    content: z.string().min(1, "Content is required"),
});

// Helper: get authenticated user
async function getAuthenticatedUser(request: Request, context: LoaderFunctionArgs["context"]) {
    const auth = createAuth((context as { cloudflare: { env: Env } }).cloudflare.env);
    const session = await auth.api.getSession({
        headers: request.headers,
    });
    return session?.user;
}

// GET: List posts or get single post
export async function loader({ request, context }: LoaderFunctionArgs) {
    const db = getDb(context.cloudflare.env);
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (id) {
        // Get single post
        const [result] = await db.select().from(post).where(eq(post.id, id));
        if (!result) {
            return data({ success: false, error: "Post not found", code: "NOT_FOUND" }, { status: 404 });
        }
        return data({ success: true, data: result });
    }

    // List all posts
    const posts = await db.select().from(post).orderBy(desc(post.createdAt));
    return data({ success: true, data: posts });
}

// POST/PUT/DELETE: Create, update, delete posts
export async function action({ request, context }: ActionFunctionArgs) {
    const user = await getAuthenticatedUser(request, context);
    if (!user) {
        return data({ success: false, error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const db = getDb(context.cloudflare.env);
    const method = request.method;

    if (method === "POST") {
        // Create post
        const body = await request.json();
        const validation = postSchema.safeParse(body);
        if (!validation.success) {
            return data({
                success: false,
                error: validation.error.issues[0].message,
                code: "VALIDATION_ERROR"
            }, { status: 400 });
        }

        const [newPost] = await db.insert(post).values({
            title: validation.data.title,
            content: validation.data.content,
            authorId: user.id,
        }).returning();

        return data({ success: true, data: newPost }, { status: 201 });
    }

    if (method === "PUT") {
        // Update post
        const body = await request.json() as { id?: string; title?: string; content?: string };
        const { id, ...updateData } = body;

        if (!id) {
            return data({ success: false, error: "Post ID required", code: "VALIDATION_ERROR" }, { status: 400 });
        }

        // Check ownership
        const [existing] = await db.select().from(post).where(eq(post.id, id));
        if (!existing) {
            return data({ success: false, error: "Post not found", code: "NOT_FOUND" }, { status: 404 });
        }
        if (existing.authorId !== user.id) {
            return data({ success: false, error: "Not your post", code: "FORBIDDEN" }, { status: 403 });
        }

        const validation = postSchema.safeParse(updateData);
        if (!validation.success) {
            return data({
                success: false,
                error: validation.error.issues[0].message,
                code: "VALIDATION_ERROR"
            }, { status: 400 });
        }

        const [updated] = await db.update(post)
            .set({
                title: validation.data.title,
                content: validation.data.content,
                updatedAt: new Date(),
            })
            .where(eq(post.id, id))
            .returning();

        return data({ success: true, data: updated });
    }

    if (method === "DELETE") {
        // Delete post
        const body = await request.json() as { id?: string };
        const { id } = body;

        if (!id) {
            return data({ success: false, error: "Post ID required", code: "VALIDATION_ERROR" }, { status: 400 });
        }

        // Check ownership
        const [existing] = await db.select().from(post).where(eq(post.id, id));
        if (!existing) {
            return data({ success: false, error: "Post not found", code: "NOT_FOUND" }, { status: 404 });
        }
        if (existing.authorId !== user.id) {
            return data({ success: false, error: "Not your post", code: "FORBIDDEN" }, { status: 403 });
        }

        await db.delete(post).where(eq(post.id, id));

        return data({ success: true, data: { id } });
    }

    return data({ success: false, error: "Method not allowed" }, { status: 405 });
}
