/**
 * /api/v1/correspondence/reports
 *
 * POST — Generate a compliance position report for a specific client
 * GET  — List generated reports (optionally filtered by clientId)
 *
 * Requires broker or admin role.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getAuthUser } from '@/lib/auth/middleware';

// ---------------------------------------------------------------------------
// POST — generate report (single or batch)
// ---------------------------------------------------------------------------

async function handlePost(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user?.organisationId) {
      return NextResponse.json(
        { error: 'No organisation associated with account' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { clientId, batch, period } = body as {
      clientId?: string;
      batch?: boolean;
      period?: string;
    };

    const { generateClientPositionReport, generateBatchReports, getDemoClientData } =
      await import('@/lib/correspondence/client-reporting');

    const demoClients = getDemoClientData();

    if (batch) {
      const reports = await generateBatchReports(demoClients, period, {
        userId: user.id,
        organisationId: user.organisationId,
      });
      return NextResponse.json({
        reports: reports.map(r => ({
          id: r.id,
          clientId: r.clientId,
          clientName: r.clientName,
          period: r.period,
          subject: r.subject,
          status: r.status,
          generatedAt: r.generatedAt,
        })),
        total: reports.length,
      });
    }

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId is required (or set batch: true)' },
        { status: 400 }
      );
    }

    const clientData = demoClients.find(c => c.clientId === clientId);
    if (!clientData) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const report = await generateClientPositionReport(clientData, period, {
      userId: user.id,
      organisationId: user.organisationId,
    });

    return NextResponse.json({
      id: report.id,
      clientId: report.clientId,
      clientName: report.clientName,
      period: report.period,
      subject: report.subject,
      body: report.body,
      status: report.status,
      generatedAt: report.generatedAt,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// GET — list reports
// ---------------------------------------------------------------------------

async function handleGet(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    const { getAllReports, getReportsByClient } = await import(
      '@/lib/correspondence/client-reporting'
    );

    const reports = clientId ? getReportsByClient(clientId) : getAllReports();

    return NextResponse.json({
      reports: reports.map(r => ({
        id: r.id,
        clientId: r.clientId,
        clientName: r.clientName,
        period: r.period,
        subject: r.subject,
        status: r.status,
        generatedAt: r.generatedAt,
        sentAt: r.sentAt,
      })),
      total: reports.length,
    });
  } catch {
    return NextResponse.json(
      { reports: [], total: 0, error: 'Failed to list reports' },
      { status: 200 }
    );
  }
}

export const POST = withAuth(handlePost, { roles: ['admin', 'broker'] });
export const GET = withAuth(handleGet, { roles: ['admin', 'broker'] });
