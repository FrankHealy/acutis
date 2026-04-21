import { NextResponse } from "next/server";
import { listStoredMaps, saveStoredMap } from "./mapStorage";

export async function GET() {
  try {
    const maps = await listStoredMaps();
    return NextResponse.json({ maps });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to list maps.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      fileName?: string;
      actor?: string;
      document?: unknown;
    };

    if (!body.document || typeof body.document !== "object") {
      return NextResponse.json({ error: "A document payload is required." }, { status: 400 });
    }

    const saved = await saveStoredMap({
      fileName: body.fileName,
      actor: body.actor,
      document: body.document as never,
    });

    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save map.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
