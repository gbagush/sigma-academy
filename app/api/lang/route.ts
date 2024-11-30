import { languages } from "@/config/lang";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (code) {
      const language = languages.find((lang) => lang.code === code);

      if (!language) {
        return NextResponse.json(
          {
            message: "Language not found",
          },
          {
            status: 404,
          }
        );
      }

      return NextResponse.json(
        {
          message: "Success getting language",
          data: language,
        },
        {
          status: 200,
        }
      );
    } else {
      return NextResponse.json(
        {
          message: "Success getting languages",
          data: languages,
        },
        {
          status: 200,
        }
      );
    }
  } catch (error) {
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
