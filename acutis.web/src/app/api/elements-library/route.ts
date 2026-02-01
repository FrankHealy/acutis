/**
 * GET /api/elements-library
 *
 * Returns the full form elements library.
 */

import { NextResponse } from "next/server";
import { formElementsLibraryService } from "@/lib/formElementsLibraryService";

export async function GET() {
  try {
    const library = formElementsLibraryService.getLibrary();
    return NextResponse.json(library);
  } catch (error) {
    console.error("Get library error:", error);
    return NextResponse.json({ error: "Failed to load library" }, { status: 500 });
  }
}
