/**
 * WREI Token Metadata API
 *
 * Provides access to stored token metadata for analytics, reporting,
 * and token lifecycle tracking.
 */

import { NextRequest } from 'next/server';
import { tokenMetadataSystem } from '@/lib/token-metadata';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'query';

    switch (action) {
      case 'query': {
        // Query tokens with optional filters
        const tokenType = searchParams.get('tokenType') as any;
        const vesselId = searchParams.get('vesselId');
        const minQualityScore = searchParams.get('minQualityScore');
        const verificationStatus = searchParams.get('verificationStatus');
        const fromDate = searchParams.get('fromDate');
        const toDate = searchParams.get('toDate');

        const query: any = {};
        if (tokenType) query.tokenType = tokenType;
        if (vesselId) query.vesselId = vesselId;
        if (minQualityScore) query.minQualityScore = parseFloat(minQualityScore);
        if (verificationStatus) query.verificationStatus = verificationStatus === 'true';
        if (fromDate && toDate) query.dateRange = { from: fromDate, to: toDate };

        const result = tokenMetadataSystem.queryTokens(query);

        return Response.json({
          success: true,
          data: result,
          query
        });
      }

      case 'statistics': {
        // Get metadata statistics
        const stats = tokenMetadataSystem.getMetadataStatistics();

        return Response.json({
          success: true,
          data: stats
        });
      }

      case 'retrieve': {
        // Retrieve specific token metadata
        const tokenId = searchParams.get('tokenId');
        if (!tokenId) {
          return Response.json({
            success: false,
            error: 'tokenId parameter is required'
          }, { status: 400 });
        }

        const metadata = tokenMetadataSystem.retrieveTokenMetadata(tokenId);
        if (!metadata) {
          return Response.json({
            success: false,
            error: 'Token metadata not found'
          }, { status: 404 });
        }

        return Response.json({
          success: true,
          data: metadata
        });
      }

      case 'tokens': {
        // Get all token IDs
        const tokenIds = tokenMetadataSystem.getAllTokenIds();

        return Response.json({
          success: true,
          data: {
            tokenIds,
            count: tokenIds.length
          }
        });
      }

      default:
        return Response.json({
          success: false,
          error: 'Invalid action. Supported actions: query, statistics, retrieve, tokens'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('[WREI Metadata API] Error:', error);

    return Response.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'clear') {
      // Clear all metadata (for testing/demo purposes)
      tokenMetadataSystem.clearAllMetadata();

      return Response.json({
        success: true,
        message: 'All metadata cleared'
      });
    }

    return Response.json({
      success: false,
      error: 'Invalid action. Supported actions: clear'
    }, { status: 400 });

  } catch (error) {
    console.error('[WREI Metadata API] Delete error:', error);

    return Response.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}