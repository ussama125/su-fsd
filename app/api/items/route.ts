import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { parse } from "csv-parse/sync"

export async function GET() {
  try {
    // Get the absolute path to the CSV file
    const filePath = path.join(process.cwd(), "items.csv")

    // Read the CSV file
    const fileContent = await fs.readFile(filePath, "utf-8")

    // Parse the CSV content
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    })

    return NextResponse.json(records)
  } catch (error) {
    console.error("Error reading CSV file:", error)
    return NextResponse.json({ error: "Failed to read items" }, { status: 500 })
  }
}

