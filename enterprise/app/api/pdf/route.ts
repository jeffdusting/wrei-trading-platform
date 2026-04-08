import { NextResponse } from 'next/server'
import { generateAssessmentPdf, type AssessmentPdfData } from '@enterprise/lib/pdf/certificate-opportunity-assessment'

/**
 * PDF Generation API
 * POST: generates a branded Certificate Opportunity Assessment PDF
 * Accepts assessment data directly (DB fetch is optional)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // If assessment_id provided, try to fetch from DB
    let assessmentData: AssessmentPdfData
    if (body.assessment_id) {
      try {
        const { sql } = await import('@shared/lib/db/connection')
        const result = await sql`
          SELECT * FROM diagnostic_assessments WHERE id = ${body.assessment_id}
        `
        if (result.rows.length > 0) {
          const row = result.rows[0] as Record<string, unknown>
          assessmentData = {
            projectName: String(row.project_name),
            jurisdiction: String(row.jurisdiction),
            scheme: String(row.scheme),
            method: String(row.method),
            activityType: row.activity_type ? String(row.activity_type) : undefined,
            eligible: Boolean(row.eligible),
            yieldEstimate: row.yield_estimate ? Number(row.yield_estimate) : undefined,
            yieldUnit: String(row.scheme) === 'VEU' ? 'VEEC' : 'ESC',
            currentValue: row.current_value ? Number(row.current_value) : undefined,
            forecastValue: row.forecast_value ? Number(row.forecast_value) : undefined,
          }
        } else {
          return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
        }
      } catch {
        // DB unavailable — fall through to body data
        assessmentData = body as AssessmentPdfData
      }
    } else {
      // Use directly provided data
      assessmentData = {
        projectName: body.projectName ?? 'Untitled Assessment',
        jurisdiction: body.jurisdiction ?? 'NSW',
        scheme: body.scheme ?? 'ESS',
        method: body.method ?? 'HEER',
        activityType: body.activityType,
        eligible: body.eligible ?? true,
        disqualifiers: body.disqualifiers,
        yieldEstimate: body.yieldEstimate,
        yieldUnit: body.yieldUnit ?? 'ESC',
        currentPrice: body.currentPrice,
        forecastPrice: body.forecastPrice,
        currentValue: body.currentValue,
        forecastValue: body.forecastValue,
        eligibleSaver: body.eligibleSaver,
        splitIncentive: body.splitIncentive,
        requiredActions: body.requiredActions,
      }
    }

    const pdfBuffer = await generateAssessmentPdf(assessmentData)

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate-assessment-${assessmentData.projectName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'PDF generation failed', message: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
