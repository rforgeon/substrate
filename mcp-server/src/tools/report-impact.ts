import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { SubstrateContext } from '../server.js';
import type { ReportImpactOutput } from '../schemas/tools.js';

export function registerReportImpactTool(server: McpServer, context: SubstrateContext): void {
  server.tool(
    'substrate_report_impact',
    'Report the actual impact after using advice from an observation. Helps improve advice quality by tracking what works.',
    {
      observation_id: z.string().describe('ID of the observation whose advice was used'),
      helpful: z.boolean().describe('Was this advice helpful for completing the task?'),
      task_succeeded: z.boolean().optional().describe('Did the task succeed using this advice?'),
      actual_time_saved_seconds: z.number().min(0).optional().describe('Actual time saved in seconds'),
      feedback: z.string().max(500).optional().describe('Optional feedback about the advice'),
    },
    async (args): Promise<{ content: Array<{ type: 'text'; text: string }> }> => {
      try {
        const { observation_id, helpful, task_succeeded, actual_time_saved_seconds, feedback } = args;

        // Add the impact report
        const result = context.storage.addImpactReport(observation_id, {
          agent_hash: context.agentHash,
          helpful,
          task_succeeded,
          actual_time_saved_seconds,
          feedback,
        });

        if (!result.success) {
          const output: ReportImpactOutput = {
            success: false,
            observation_id,
            message: 'Observation not found',
          };

          return {
            content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
          };
        }

        const stats = result.updated_stats;
        const output: ReportImpactOutput = {
          success: true,
          observation_id,
          message: `Impact reported. ${helpful ? 'Marked as helpful.' : 'Marked as not helpful.'} Total uses: ${stats?.total_uses ?? 0}`,
          updated_stats: stats ? {
            total_uses: stats.total_uses,
            helpful_rate: stats.helpful_count / stats.total_uses * 100,
            avg_time_saved_seconds: stats.avg_time_saved_seconds,
            success_rate: stats.success_rate,
          } : undefined,
        };

        context.logger.info(`Impact reported for ${observation_id}: helpful=${helpful}`);

        return {
          content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        context.logger.error('Report impact failed:', message);

        return {
          content: [{ type: 'text', text: JSON.stringify({ error: message }, null, 2) }],
        };
      }
    }
  );
}
