"use client"

import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"

interface Item {
  filename: string
  createdAt: string
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([])
  const [sortBy, setSortBy] = useState("created-asc")

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/items")
      if (!response.ok) {
        throw new Error("Failed to fetch items")
      }
      const data = await response.json()
      setItems(data)
    } catch (error) {
      console.error("Error fetching items:", error)
      // You might want to set an error state here and display it to the user
    }
  }

  const sortItems = (type: string) => {
    setSortBy(type)
    const sortedItems = [...items]

    switch (type) {
      case "created-asc":
        sortedItems.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case "created-desc":
        sortedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "filename-asc":
      case "filename-desc":
        sortedItems.sort((a, b) => {
          const aFilename = a.filename;
          const bFilename = b.filename;

          // Determine if filenames start with letters
          const aStartsWithLetter = /^[a-zA-Z]/.test(aFilename);
          const bStartsWithLetter = /^[a-zA-Z]/.test(bFilename);

          // If one starts with a letter and one doesn't
          if (aStartsWithLetter !== bStartsWithLetter) {
            // Files starting with non-letters come first in ascending order
            return aStartsWithLetter ?
              (type === "filename-asc" ? 1 : -1) :
              (type === "filename-asc" ? -1 : 1);
          }

          // If both start with letters
          if (aStartsWithLetter) {
            // Extract the letter prefix and any following numbers
            const aLetterPrefix = aFilename.match(/^[a-zA-Z]+/)?.[0] || "";
            const bLetterPrefix = bFilename.match(/^[a-zA-Z]+/)?.[0] || "";

            // Compare the letter prefixes
            const prefixCompare = aLetterPrefix.localeCompare(bLetterPrefix);
            if (prefixCompare !== 0) {
              return type === "filename-asc" ? prefixCompare : -prefixCompare;
            }

            // If letter prefixes are the same, check for following numbers
            const aNumMatch = aFilename.substring(aLetterPrefix.length).match(/^(\d+)/);
            const bNumMatch = bFilename.substring(bLetterPrefix.length).match(/^(\d+)/);

            // If one has a number and one doesn't, the one without comes first
            if (!aNumMatch && bNumMatch) {
              return type === "filename-asc" ? -1 : 1;
            }
            if (aNumMatch && !bNumMatch) {
              return type === "filename-asc" ? 1 : -1;
            }

            // If both have numbers, compare them numerically
            if (aNumMatch && bNumMatch) {
              const aNum = parseInt(aNumMatch[1], 10);
              const bNum = parseInt(bNumMatch[1], 10);

              if (aNum !== bNum) {
                return type === "filename-asc" ? aNum - bNum : bNum - aNum;
              }
            }
          }
          // For files starting with digits
          else {
            const aNumMatch = aFilename.match(/^(\d+)/);
            const bNumMatch = bFilename.match(/^(\d+)/);

            // If both have leading numbers
            if (aNumMatch && bNumMatch) {
              // Compare the integer values first
              const aNum = parseInt(aNumMatch[1], 10);
              const bNum = parseInt(bNumMatch[1], 10);

              if (aNum !== bNum) {
                // Sort by numeric value
                return type === "filename-asc" ? aNum - bNum : bNum - aNum;
              }
              else {
                // If the integer values are the same, more leading zeros come first
                const aLeadingZeros = aNumMatch[1].match(/^0+/)?.[0]?.length || 0;
                const bLeadingZeros = bNumMatch[1].match(/^0+/)?.[0]?.length || 0;

                if (aLeadingZeros !== bLeadingZeros) {
                  return type === "filename-asc" ?
                    bLeadingZeros - aLeadingZeros :
                    aLeadingZeros - bLeadingZeros;
                }
              }
            }
          }

          // Default to standard string comparison
          return type === "filename-asc" ?
            aFilename.localeCompare(bFilename) :
            bFilename.localeCompare(aFilename);
        })
        break
    }

    setItems(sortedItems)
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Select value={sortBy} onValueChange={sortItems}>
          <SelectTrigger className="w-[200px] bg-transparent text-white border-white/20">
            <SelectValue placeholder="Sort by created at" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created-asc">Sort by created at</SelectItem>
            <SelectItem value="filename-asc">Sort by filename ascending</SelectItem>
            <SelectItem value="filename-desc">Sort by filename descending</SelectItem>
          </SelectContent>
        </Select>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <Card key={item.filename} className="p-4 bg-transparent text-white border-white/20">
              <div className="space-y-1">
                <div className="text-sm text-gray-400">{new Date(item.createdAt).toLocaleString()}</div>
                <div className="text-lg">{item.filename}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

