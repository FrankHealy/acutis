import { NextResponse } from "next/server";
import { getFallbackScreeningElementsLibrary } from "@/areas/config/screeningFormLibrary";

export async function GET() {
  return NextResponse.json({ categories: getFallbackScreeningElementsLibrary() });
}
