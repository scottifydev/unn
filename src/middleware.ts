import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";
import type { UserRole } from "@/lib/supabase/database.types";

const ROLE_HIERARCHY: Record<UserRole, number> = {
  reader: 0,
  contributor: 1,
  editor: 2,
  admin: 3,
};

const PROTECTED_ROUTES: { pattern: RegExp; minRole: UserRole }[] = [
  { pattern: /^\/submit/, minRole: "contributor" },
  { pattern: /^\/editor/, minRole: "editor" },
  { pattern: /^\/admin/, minRole: "admin" },
];

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  const protectedRoute = PROTECTED_ROUTES.find((r) =>
    r.pattern.test(request.nextUrl.pathname)
  );

  if (!protectedRoute) return response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const userRole = (profile?.role as UserRole) ?? "reader";
  const requiredLevel = ROLE_HIERARCHY[protectedRoute.minRole];
  const userLevel = ROLE_HIERARCHY[userRole];

  if (userLevel < requiredLevel) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
