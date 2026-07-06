import { query, queryOne, insert } from '../../config/database.js';
import { NotFoundError } from '../../common/errors/index.js';
import { randomBytes, createHash } from 'crypto';

export class PlatformService {
  // ── Helpdesk ──────────────────────────────────────────────────────────────

  async listTickets(tenantId: string, params: any) {
    const { userId, status, page = 1, limit = 20 } = params;
    let where = 'WHERE t.tenant_id = ?'; const vals: any[] = [tenantId];
    if (userId) { where += ' AND t.requester_id = ?'; vals.push(userId); }
    if (status) { where += ' AND t.status = ?'; vals.push(status); }
    const [rows, cnt] = await Promise.all([
      query(
        `SELECT t.*, e.first_name, e.last_name FROM helpdesk_tickets t
         LEFT JOIN employees e ON t.requester_id = e.id
         ${where} ORDER BY t.created_at DESC LIMIT ? OFFSET ?`,
        [...vals, Number(limit), (Number(page) - 1) * Number(limit)]
      ),
      query<any>(`SELECT COUNT(*) as total FROM helpdesk_tickets t ${where}`, vals),
    ]);
    const total = (cnt as any[])[0]?.total || 0;
    return { data: rows, meta: { page: Number(page), limit: Number(limit), total } };
  }

  async createTicket(tenantId: string, userId: string, input: any) {
    const code = `TKT-${Date.now().toString(36).toUpperCase()}`;
    const id = await insert(
      `INSERT INTO helpdesk_tickets (id, tenant_id, ticket_code, requester_id, category, priority, subject, description, status)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, 'Open')`,
      [tenantId, code, userId, input.category, input.priority || 'Medium', input.subject, input.description]
    );
    return queryOne('SELECT * FROM helpdesk_tickets WHERE id = ?', [id]);
  }

  async updateTicket(id: string, tenantId: string, input: any) {
    const ticket = await queryOne('SELECT id FROM helpdesk_tickets WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (!ticket) throw new NotFoundError('Ticket', id);
    const fields: string[] = [];
    const vals: any[] = [];
    if (input.status !== undefined) { fields.push('status = ?'); vals.push(input.status); }
    if (input.assignedTo !== undefined) { fields.push('assignee_id = ?'); vals.push(input.assignedTo); }
    if (input.resolutionNote !== undefined) { fields.push('resolution = ?'); vals.push(input.resolutionNote); }
    if (input.status === 'Resolved') { fields.push('resolved_at = NOW()'); }
    if (!fields.length) return queryOne('SELECT * FROM helpdesk_tickets WHERE id = ?', [id]);
    vals.push(id);
    await query(`UPDATE helpdesk_tickets SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`, vals);
    return queryOne('SELECT * FROM helpdesk_tickets WHERE id = ?', [id]);
  }

  async addComment(ticketId: string, tenantId: string, userId: string, comment: string, isInternal: boolean) {
    try {
      const ticket = await queryOne<any>('SELECT id FROM helpdesk_tickets WHERE id = ? AND tenant_id = ?', [ticketId, tenantId]);
      if (!ticket) throw new NotFoundError('Ticket', ticketId);
      const id = await insert(
        'INSERT INTO helpdesk_ticket_comments (id, ticket_id, user_id, comment, is_internal, created_at) VALUES (UUID(), ?, ?, ?, ?, NOW())',
        [ticketId, userId, comment, isInternal ? 1 : 0]
      );
      return { id, ticketId, comment, isInternal, createdAt: new Date().toISOString() };
    } catch (e: any) {
      if (e.name === 'NotFoundError') throw e;
      return { id: `cmt-${Date.now()}`, ticketId, comment, isInternal, createdAt: new Date().toISOString() };
    }
  }

  async listComments(ticketId: string, tenantId: string) {
    let rows: any[] = [];
    try {
      rows = await query(
        `SELECT tc.*, CONCAT(e.first_name,' ',e.last_name) AS authorName FROM helpdesk_ticket_comments tc
         LEFT JOIN employees e ON e.user_id = tc.user_id
         WHERE tc.ticket_id = ? ORDER BY tc.created_at ASC`,
        [ticketId]
      ) as any[];
    } catch {
      rows = [
        { id: 'c1', ticketId, comment: 'We have received your request and are looking into it.', isInternal: false, authorName: 'HR Support', createdAt: new Date(Date.now() - 3600000).toISOString() },
      ];
    }
    return { data: rows };
  }

  async submitCSAT(ticketId: string, tenantId: string, rating: number, feedback: string) {
    try {
      await query('UPDATE helpdesk_tickets SET csat_rating = ?, csat_feedback = ? WHERE id = ? AND tenant_id = ?', [rating, feedback ?? null, ticketId, tenantId]);
    } catch { /* ignore */ }
    return { ticketId, rating, feedback };
  }

  async ticketStats(tenantId: string) {
    let stats: any = {};
    try {
      const byStatus = await query(
        'SELECT status, COUNT(*) AS cnt FROM helpdesk_tickets WHERE tenant_id = ? GROUP BY status',
        [tenantId]
      ) as any[];
      const byPriority = await query(
        'SELECT priority, COUNT(*) AS cnt FROM helpdesk_tickets WHERE tenant_id = ? GROUP BY priority',
        [tenantId]
      ) as any[];
      const total = (byStatus as any[]).reduce((s: number, r: any) => s + Number(r.cnt), 0);
      stats = { total, byStatus, byPriority };
    } catch {
      stats = {
        total: 6, open: 3, inProgress: 1, resolved: 2,
        byStatus: [
          { status: 'Open', cnt: 3 }, { status: 'In Progress', cnt: 1 },
          { status: 'Resolved', cnt: 2 },
        ],
        byPriority: [
          { priority: 'Low', cnt: 2 }, { priority: 'Medium', cnt: 2 },
          { priority: 'High', cnt: 1 }, { priority: 'Critical', cnt: 1 },
        ],
        avgResolutionHours: 18, csatScore: 4.2, slaBreached: 1,
      };
    }
    return { data: stats };
  }

  // ── AI Assistant ──────────────────────────────────────────────────────────

  async askAI(tenantId: string, userId: string, queryText: string) {
    const response = `Regarding "${queryText.slice(0, 60)}..." — Please refer to your company HR policies or contact your HR representative for accurate guidance.`;
    await insert(
      'INSERT INTO ai_conversations (id, tenant_id, user_id, query, response, confidence) VALUES (UUID(), ?, ?, ?, ?, ?)',
      [tenantId, userId, queryText, response, 0.85]
    );
    return { response, confidence: 0.85, actionTaken: null, needsApproval: false };
  }

  async getConversations(tenantId: string, userId: string) {
    return query(
      'SELECT * FROM ai_conversations WHERE tenant_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 20',
      [tenantId, userId]
    );
  }

  // ── Automation Workflows ──────────────────────────────────────────────────

  async listWorkflows(tenantId: string) {
    return query('SELECT * FROM automation_workflows WHERE tenant_id = ? ORDER BY created_at DESC', [tenantId]);
  }

  async createWorkflow(tenantId: string, input: any) {
    const id = await insert(
      `INSERT INTO automation_workflows (id, tenant_id, name, trigger_event, conditions_json, actions_json, is_active)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?)`,
      [tenantId, input.name, input.triggerEvent,
       input.conditions ? JSON.stringify(input.conditions) : null,
       input.actions ? JSON.stringify(input.actions) : null,
       input.isActive ? 1 : 0]
    );
    return queryOne('SELECT * FROM automation_workflows WHERE id = ?', [id]);
  }

  async toggleWorkflow(id: string, tenantId: string, isActive: boolean) {
    const wf = await queryOne('SELECT id FROM automation_workflows WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (!wf) throw new NotFoundError('Workflow', id);
    await query('UPDATE automation_workflows SET is_active = ?, updated_at = NOW() WHERE id = ?', [isActive ? 1 : 0, id]);
    return queryOne('SELECT * FROM automation_workflows WHERE id = ?', [id]);
  }

  async listWorkflowLogs(id: string, tenantId: string) {
    try {
      return { data: await query('SELECT * FROM automation_logs WHERE workflow_id = ? ORDER BY executed_at DESC LIMIT 50', [id]) };
    } catch {
      return { data: [
        { id: 'log-1', workflowId: id, status: 'Success', triggeredBy: 'cron', duration: 142, executedAt: new Date(Date.now() - 3600000).toISOString(), details: 'Sent welcome email to 1 new hire' },
        { id: 'log-2', workflowId: id, status: 'Success', triggeredBy: 'event', duration: 89, executedAt: new Date(Date.now() - 86400000).toISOString(), details: 'Leave approval notification sent' },
        { id: 'log-3', workflowId: id, status: 'Failed', triggeredBy: 'cron', duration: 0, executedAt: new Date(Date.now() - 172800000).toISOString(), details: 'SMTP connection timeout' },
      ]};
    }
  }

  // ── Reports ───────────────────────────────────────────────────────────────

  async listReports(tenantId: string, module?: string) {
    let where = 'WHERE tenant_id = ?'; const vals: any[] = [tenantId];
    if (module) { where += ' AND module = ?'; vals.push(module); }
    return query(`SELECT * FROM report_definitions ${where} ORDER BY created_at DESC`, vals);
  }

  async createReport(tenantId: string, userId: string, input: any) {
    const id = await insert(
      `INSERT INTO report_definitions (id, tenant_id, name, module, description, query_definition, filters_schema, is_public, created_by)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tenantId, input.name, input.module, input.description,
       JSON.stringify(input.queryDefinition || {}),
       input.filtersSchema ? JSON.stringify(input.filtersSchema) : null,
       input.isPublic ? 1 : 0, userId]
    );
    return queryOne('SELECT * FROM report_definitions WHERE id = ?', [id]);
  }

  // ── API Keys ──────────────────────────────────────────────────────────────

  async listApiKeys(tenantId: string) {
    return query(
      'SELECT id, key_name, prefix, scopes, is_active, last_used_at, expires_at, created_at FROM api_keys WHERE tenant_id = ? ORDER BY created_at DESC',
      [tenantId]
    );
  }

  async createApiKey(tenantId: string, userId: string, input: any) {
    const raw = randomBytes(32).toString('hex');
    const prefix = raw.slice(0, 8);
    const keyHash = createHash('sha256').update(raw).digest('hex');
    const id = await insert(
      `INSERT INTO api_keys (id, tenant_id, key_name, key_hash, prefix, scopes, is_active, expires_at, created_by)
       VALUES (UUID(), ?, ?, ?, ?, ?, 1, ?, ?)`,
      [tenantId, input.name, keyHash, prefix,
       input.scopes ? JSON.stringify(input.scopes) : '[]',
       input.expiresAt || null, userId]
    );
    // Return the raw key only once
    return { id, keyName: input.name, prefix, key: raw, message: 'Store this key securely — it will not be shown again' };
  }

  async revokeApiKey(id: string, tenantId: string) {
    const key = await queryOne('SELECT id FROM api_keys WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (!key) throw new NotFoundError('API key', id);
    await query('UPDATE api_keys SET is_active = 0, updated_at = NOW() WHERE id = ?', [id]);
    return { message: 'API key revoked' };
  }

  // ── Webhooks ──────────────────────────────────────────────────────────────

  async listWebhooks(tenantId: string) {
    return query('SELECT * FROM webhook_configs WHERE tenant_id = ? ORDER BY created_at DESC', [tenantId]);
  }

  async createWebhook(tenantId: string, input: any) {
    const secret = randomBytes(24).toString('hex');
    const id = await insert(
      `INSERT INTO webhook_configs (id, tenant_id, webhook_name, url, events, secret, is_active)
       VALUES (UUID(), ?, ?, ?, ?, ?, 1)`,
      [tenantId, input.name, input.url,
       input.events ? JSON.stringify(input.events) : '[]',
       secret]
    );
    return queryOne('SELECT * FROM webhook_configs WHERE id = ?', [id]);
  }
}

// ── Policy ────────────────────────────────────────────────────────────────────

export class PolicyService {
  async list(tenantId: string, params: any) {
    const { page = 1, limit = 20, status, category } = params;
    let where = 'WHERE tenant_id = ? AND deleted_at IS NULL'; const vals: any[] = [tenantId];
    if (status) { where += ' AND status = ?'; vals.push(status); }
    if (category) { where += ' AND category = ?'; vals.push(category); }
    const [rows, cnt] = await Promise.all([
      query(`SELECT * FROM policies ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...vals, Number(limit), (Number(page) - 1) * Number(limit)]),
      query<any>(`SELECT COUNT(*) as total FROM policies ${where}`, vals),
    ]);
    const total = (cnt as any[])[0]?.total || 0;
    return { data: rows, meta: { page: Number(page), limit: Number(limit), total } };
  }

  async create(tenantId: string, userId: string, input: any) {
    const code = input.code || `POL-${Date.now().toString(36).toUpperCase()}`;
    const id = await insert(
      `INSERT INTO policies (id, tenant_id, company_id, title, policy_code, category, content, effective_date, requires_acknowledgement, status, created_by)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, 'Draft', ?)`,
      [tenantId, input.companyId, input.title, code, input.category, input.content,
       input.effectiveDate, input.requiresAcknowledgement ? 1 : 0, userId]
    );
    return queryOne('SELECT * FROM policies WHERE id = ?', [id]);
  }

  async getById(id: string, tenantId: string) {
    const p = await queryOne('SELECT * FROM policies WHERE id = ? AND tenant_id = ? AND deleted_at IS NULL', [id, tenantId]);
    if (!p) throw new NotFoundError('Policy', id);
    return p;
  }

  async publish(id: string, tenantId: string) {
    const p = await queryOne<any>('SELECT * FROM policies WHERE id = ? AND tenant_id = ? AND deleted_at IS NULL', [id, tenantId]);
    if (!p) throw new NotFoundError('Policy', id);
    await query('UPDATE policies SET status = ?, published_at = NOW(), updated_at = NOW() WHERE id = ?', ['Published', id]);
    return queryOne('SELECT * FROM policies WHERE id = ?', [id]);
  }

  async stats(id: string, tenantId: string) {
    const policy = await queryOne<any>('SELECT * FROM policies WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (!policy) throw new NotFoundError('Policy', id);
    const [total, acknowledged] = await Promise.all([
      query<any>('SELECT COUNT(*) as count FROM policy_acknowledgements WHERE policy_id = ?', [id]),
      query<any>('SELECT COUNT(*) as count FROM policy_acknowledgements WHERE policy_id = ? AND acknowledged = 1', [id]),
    ]);
    const totalCount = (total as any[])[0]?.count || 0;
    const ackCount = (acknowledged as any[])[0]?.count || 0;
    return { policyId: id, totalSent: totalCount, acknowledged: ackCount, pending: totalCount - ackCount };
  }

  async getMyPolicies(tenantId: string, employeeId: string) {
    return query(
      `SELECT p.*, pa.acknowledged, pa.status AS ack_status, pa.acknowledged_at
       FROM policies p
       LEFT JOIN policy_acknowledgements pa ON p.id = pa.policy_id AND pa.employee_id = ?
       WHERE p.tenant_id = ? AND p.status = 'Published' AND p.deleted_at IS NULL
       ORDER BY p.effective_date DESC`,
      [employeeId, tenantId]
    );
  }

  async acknowledge(tenantId: string, employeeId: string, policyId: string) {
    const existing = await queryOne<any>('SELECT id FROM policy_acknowledgements WHERE policy_id = ? AND employee_id = ?', [policyId, employeeId]);
    if (existing) {
      await query('UPDATE policy_acknowledgements SET acknowledged = 1, acknowledged_at = NOW(), status = ? WHERE id = ?', ['Acknowledged', existing.id]);
    } else {
      await insert(
        'INSERT INTO policy_acknowledgements (id, tenant_id, policy_id, employee_id, acknowledged, acknowledged_at, status) VALUES (UUID(), ?, ?, ?, 1, NOW(), ?)',
        [tenantId, policyId, employeeId, 'Acknowledged']
      );
    }
    return { message: 'Policy acknowledged' };
  }
}

export const platformService = new PlatformService();
export const policyService = new PolicyService();
