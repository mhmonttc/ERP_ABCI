import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../../middleware/auth';

export const GET = withAuth(async (req) => {
    return NextResponse.json({
        valid: true,
        user: req.user
    });
});