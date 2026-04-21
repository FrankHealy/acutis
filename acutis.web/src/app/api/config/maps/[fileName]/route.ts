import { NextResponse } from "next/server";
import { loadStoredMap } from "../mapStorage";

type RouteContext = {
  params: Promise<{
    fileName: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { fileName } = await context.params;
    const document = await loadStoredMap(fileName);
    return NextResponse.json({ fileName, document });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load map.";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
