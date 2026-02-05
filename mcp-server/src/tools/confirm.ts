import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { SubstrateContext } from '../server.js';
import type { ConfirmOutput } from '../schemas/tools.js';

export function registerConfirmTool(server: McpServer, context: SubstrateContext): void {
  server.tool(
    'substrate_confirm',
    'Manually confirm, reject, or mark an observation as stale (admin action)',
    {
      observation_id: z.string().describe('ID of observation to act on'),
      action: z.enum(['confirm', 'reject', 'mark_stale']).describe('Confirmation action'),
      reason: z.string().optional().describe('Reason for the action'),
    },
    async (args): Promise<{ content: Array<{ type: 'text'; text: string }> }> => {
      try {
        const { observation_id, action, reason } = args;

        let result;
        switch (action) {
          case 'confirm':
            result = await context.confirmationEngine.manualConfirm(observation_id, reason);
            break;
          case 'reject':
            result = await context.confirmationEngine.reject(observation_id, reason);
            break;
          case 'mark_stale':
            result = await context.confirmationEngine.markStale(observation_id, reason);
            break;
        }

        const output: ConfirmOutput = {
          success: result.newStatus !== 'pending' || action === 'mark_stale',
          observation_id,
          new_status: result.newStatus,
          new_confidence: result.newConfidence,
          message: result.message,
        };

        context.logger.info(`Confirm: ${action} on ${observation_id} - ${result.message}`);

        return {
          content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        context.logger.error('Confirm action failed:', message);

        return {
          content: [{ type: 'text', text: JSON.stringify({ error: message }, null, 2) }],
        };
      }
    }
  );
}
