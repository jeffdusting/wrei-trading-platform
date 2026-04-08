// =============================================================================
// WREI Enterprise — Certificate Opportunity Assessment PDF Generator
//
// Server-side PDF generation using PDFKit.
// Produces a Downer-branded assessment report.
// =============================================================================

import PDFDocument from 'pdfkit'

export interface AssessmentPdfData {
  projectName: string
  jurisdiction: string
  scheme: string
  method: string
  activityType?: string
  eligible: boolean
  disqualifiers?: string[]
  yieldEstimate?: number
  yieldUnit?: string
  currentPrice?: number
  forecastPrice?: number
  currentValue?: number
  forecastValue?: number
  eligibleSaver?: string
  splitIncentive?: boolean
  requiredActions?: string[]
  date?: string
}

const DOWNER_BLUE = '#003DA5'
const DOWNER_LIGHT_BLUE = '#00A9E0'
const DARK_TEXT = '#1E293B'
const LIGHT_TEXT = '#64748B'

export function generateAssessmentPdf(data: AssessmentPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const chunks: Buffer[] = []

    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const pageWidth = doc.page.width - 100 // 50px margins each side

    // --- Header ---
    doc.rect(0, 0, doc.page.width, 80).fill(DOWNER_BLUE)
    doc.fontSize(10).fillColor('#FFFFFF').text('DW', 50, 20, { continued: true })
    doc.fontSize(14).text('  DOWNER', { continued: false })
    doc.fontSize(18).fillColor('#FFFFFF').text('Certificate Opportunity Assessment', 50, 45)

    doc.moveDown(3)
    const y = doc.y

    // --- Project Details ---
    doc.fontSize(10).fillColor(DOWNER_LIGHT_BLUE).text('PROJECT DETAILS', 50, y)
    doc.moveDown(0.3)
    doc.fontSize(10).fillColor(DARK_TEXT)

    const details = [
      ['Project Name', data.projectName],
      ['Jurisdiction', data.jurisdiction],
      ['Scheme', data.scheme],
      ['Method', data.method],
      ['Activity Type', data.activityType ?? '—'],
      ['Date', data.date ?? new Date().toISOString().split('T')[0]],
    ]

    details.forEach(([label, value]) => {
      doc.font('Helvetica-Bold').text(`${label}: `, { continued: true })
      doc.font('Helvetica').text(value ?? '—')
    })

    doc.moveDown(1)

    // --- Eligibility Outcome ---
    doc.fontSize(10).fillColor(DOWNER_LIGHT_BLUE).text('ELIGIBILITY OUTCOME')
    doc.moveDown(0.3)

    if (data.eligible) {
      doc.fontSize(11).fillColor('#10B981').text('ELIGIBLE', { continued: true })
      doc.fillColor(DARK_TEXT).text(' — All eligibility checks passed.')
    } else {
      doc.fontSize(11).fillColor('#EF4444').text('NOT ELIGIBLE', { continued: true })
      doc.fillColor(DARK_TEXT).text(' — One or more disqualifying conditions identified.')
    }

    if (data.disqualifiers && data.disqualifiers.length > 0) {
      doc.moveDown(0.3)
      doc.fontSize(9).fillColor(LIGHT_TEXT)
      data.disqualifiers.forEach(d => doc.text(`  • ${d}`))
    }

    doc.moveDown(1)

    // --- Energy Saver Attribution ---
    if (data.eligibleSaver) {
      doc.fontSize(10).fillColor(DOWNER_LIGHT_BLUE).text('ENERGY SAVER ATTRIBUTION')
      doc.moveDown(0.3)
      doc.fontSize(10).fillColor(DARK_TEXT)
      doc.font('Helvetica-Bold').text('Eligible Saver: ', { continued: true })
      doc.font('Helvetica').text(data.eligibleSaver)

      if (data.splitIncentive) {
        doc.fillColor('#F59E0B').text('Split-incentive issue identified')
        doc.fillColor(DARK_TEXT)
      }

      if (data.requiredActions && data.requiredActions.length > 0) {
        doc.moveDown(0.3)
        doc.fontSize(9).fillColor(LIGHT_TEXT).text('Required Actions:')
        data.requiredActions.forEach((a, i) => doc.text(`  ${i + 1}. ${a}`))
      }

      doc.moveDown(1)
    }

    // --- Yield Estimate ---
    if (data.yieldEstimate && data.yieldEstimate > 0) {
      doc.fontSize(10).fillColor(DOWNER_LIGHT_BLUE).text('YIELD ESTIMATE')
      doc.moveDown(0.3)

      // Table header
      doc.fontSize(9).fillColor(LIGHT_TEXT)
      const tableY = doc.y
      doc.text('Metric', 50, tableY, { width: pageWidth * 0.4 })
      doc.text('Value', 50 + pageWidth * 0.4, tableY, { width: pageWidth * 0.3, align: 'right' })
      doc.text('Unit', 50 + pageWidth * 0.7, tableY, { width: pageWidth * 0.3, align: 'right' })

      doc.moveDown(0.5)
      doc.moveTo(50, doc.y).lineTo(50 + pageWidth, doc.y).strokeColor('#E2E8F0').stroke()
      doc.moveDown(0.3)

      // Table rows
      const rows = [
        ['Estimated Certificates', data.yieldEstimate.toLocaleString(), data.yieldUnit ?? 'ESC'],
        ['Current Spot Value', data.currentValue ? `A$${data.currentValue.toLocaleString()}` : '—', `@ A$${data.currentPrice?.toFixed(2) ?? '—'}/cert`],
        ['26-Week Forecast Value', data.forecastValue ? `A$${data.forecastValue.toLocaleString()}` : '—', `@ A$${data.forecastPrice?.toFixed(2) ?? '—'}/cert`],
      ]

      rows.forEach(([metric, value, unit]) => {
        doc.fontSize(10).fillColor(DARK_TEXT)
        const rowY = doc.y
        doc.text(metric, 50, rowY, { width: pageWidth * 0.4 })
        doc.font('Helvetica-Bold').text(value, 50 + pageWidth * 0.4, rowY, { width: pageWidth * 0.3, align: 'right' })
        doc.font('Helvetica').fontSize(9).fillColor(LIGHT_TEXT).text(unit, 50 + pageWidth * 0.7, rowY, { width: pageWidth * 0.3, align: 'right' })
        doc.moveDown(0.3)
      })
    }

    doc.moveDown(2)

    // --- Disclaimer ---
    doc.moveTo(50, doc.y).lineTo(50 + pageWidth, doc.y).strokeColor('#E2E8F0').stroke()
    doc.moveDown(0.5)
    doc.fontSize(8).fillColor(LIGHT_TEXT)
    doc.text(
      'Estimates are indicative. Actual yield depends on implementation, measurement, and verification outcomes. ' +
      'Certificate prices are subject to market conditions and may vary. This assessment does not constitute financial advice.',
      { width: pageWidth }
    )

    // --- Footer ---
    const footerY = doc.page.height - 50
    doc.fontSize(8).fillColor(LIGHT_TEXT)
    doc.text('Downer Environmental Certificate Intelligence Platform | Powered by WREI', 50, footerY, { width: pageWidth, align: 'center' })

    doc.end()
  })
}
