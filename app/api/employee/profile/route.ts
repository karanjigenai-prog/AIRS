import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  try {
    // Get access token from Authorization header
    const authHeader = req.headers.get('authorization');
    const accessToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : undefined;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'No access token provided' },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated', debug: { user, userError } },
        { status: 401 }
      );
    }

    // Normalize email for safety
    const normalizedEmail = user.email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return NextResponse.json(
        { success: false, error: 'User email is undefined', debug: { user, userError } },
        { status: 400 }
      );
    }

    // Try finding by email (exact match, since table is clean now)
    let { data: employee, error } = await supabase
      .from('employees')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle();

    // Fallback: try case-insensitive if still not found
    if (!employee) {
      const { data: fallbackEmployee, error: fallbackError } = await supabase
        .from('employees')
        .select('*')
        .ilike('email', normalizedEmail)
        .maybeSingle();

      if (fallbackEmployee) {
        employee = fallbackEmployee;
        error = null;
      }
    }

    // If still not found
    if (error || !employee) {
      return NextResponse.json(
        {
          success: false,
          error: 'Profile not found',
          debug: { user, userError, employeeError: error, triedEmail: normalizedEmail },
        },
        { status: 404 }
      );
    }

    // ✅ Success
    return NextResponse.json({
      success: true,
      profile: employee,
      debug: { user, triedEmail: normalizedEmail },
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: (e as Error).message, debug: String(e) },
      { status: 500 }
    );
  }
}