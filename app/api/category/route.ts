import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId, WithId } from "mongodb";

interface Category {
  _id: ObjectId;
  name: string;
  parent?: ObjectId;
}

interface OrganizedCategory {
  id: string;
  name: string;
  subcategories?: OrganizedCategory[];
}

export async function GET(request: NextRequest) {
  try {
    const result = await db
      .collection("categories")
      .find<WithId<Category>>({})
      .sort({ name: 1 })
      .toArray();

    const parentCategoriesDict: Record<string, OrganizedCategory> = {};

    result.forEach((cat) => {
      if (!cat.parent) {
        parentCategoriesDict[cat._id.toString()] = {
          id: cat._id.toString(),
          name: cat.name,
          subcategories: [],
        };
      }
    });

    result.forEach((cat) => {
      if (cat.parent) {
        const parentId = cat.parent.toString();
        if (
          parentCategoriesDict[parentId] &&
          parentCategoriesDict[parentId].subcategories
        ) {
          parentCategoriesDict[parentId].subcategories.push({
            id: cat._id.toString(),
            name: cat.name,
          });
        }
      }
    });

    const organizedCategories = Object.values(parentCategoriesDict);

    return NextResponse.json(
      {
        message: "Success getting categories",
        data: organizedCategories,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}
