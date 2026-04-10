import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = (body.message ?? "").trim();
    const name = (body.name ?? "").trim() || null;
    const email = (body.email ?? "").trim().toLowerCase() || null;
    const role = (body.role ?? "").trim() || null;
    const rating = body.rating ? Number(body.rating) : null;

    if (!message || message.length < 10) {
      return NextResponse.json(
        { error: "Please write at least a sentence." },
        { status: 400 },
      );
    }
    if (
      rating !== null &&
      (rating < 1 || rating > 5 || !Number.isInteger(rating))
    ) {
      return NextResponse.json(
        { error: "Rating must be 1–5." },
        { status: 400 },
      );
    }
    if (email !== null) {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(email)) {
        return NextResponse.json(
          { error: "That email address doesn't look right." },
          { status: 400 },
        );
      }
    }

    await db.query(
      `INSERT INTO public.feedback (name, email, role, rating, message, source)
       VALUES ($1, $2, $3, $4, $5, 'web')`,
      [name, email, role, rating, message],
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("feedback error", err);
    return NextResponse.json(
      { error: "Could not save feedback." },
      { status: 500 },
    );
  }
}
