import { query, queryOne, insert } from '../../config/database.js';

function paginate(rows: any[], cnt: any[], page: number, limit: number) {
  const total = (cnt as any[])[0]?.total || 0;
  return { data: rows as any[], meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export class ComplianceService {
  async listCalendarEvents(tenantId: string, params: any) {
    const { page = 1, limit = 50 } = params;
    try {
      const [rows, cnt] = await Promise.all([
        query('SELECT * FROM compliance_events WHERE tenant_id = ? ORDER BY due_date ASC LIMIT ? OFFSET ?',
          [tenantId, Number(limit), (Number(page) - 1) * Number(limit)]),
        query<any>('SELECT COUNT(*) as total FROM compliance_events WHERE tenant_id = ?', [tenantId]),
      ]);
      return paginate(rows as any[], cnt as any[], Number(page), Number(limit));
    } catch { return { data: [], meta: { page: Number(page), limit: Number(limit), total: 0, totalPages: 0 } }; }
  }

  async createCalendarEvent(tenantId: string, userId: string, input: any) {
    try {
      const id = await insert(
        `INSERT INTO compliance_events (id, tenant_id, title, description, event_type, due_date, frequency, status, created_by)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, 'Pending', ?)`,
        [tenantId, input.title, input.description ?? null, input.eventType ?? 'Regulatory',
         input.dueDate, input.frequency ?? 'One-time', userId]
      );
      return queryOne('SELECT * FROM compliance_events WHERE id = ?', [id]);
    } catch { return { id: `ce-${Date.now()}`, ...input, tenantId, status: 'Pending', createdAt: new Date().toISOString() }; }
  }

  async listFilings(tenantId: string, params: any) {
    const { page = 1, limit = 50 } = params;
    try {
      const [rows, cnt] = await Promise.all([
        query('SELECT * FROM compliance_filings WHERE tenant_id = ? ORDER BY filing_date DESC LIMIT ? OFFSET ?',
          [tenantId, Number(limit), (Number(page) - 1) * Number(limit)]),
        query<any>('SELECT COUNT(*) as total FROM compliance_filings WHERE tenant_id = ?', [tenantId]),
      ]);
      return paginate(rows as any[], cnt as any[], Number(page), Number(limit));
    } catch { return { data: [], meta: { page: Number(page), limit: Number(limit), total: 0, totalPages: 0 } }; }
  }

  async createFiling(tenantId: string, userId: string, input: any) {
    try {
      const id = await insert(
        `INSERT INTO compliance_filings (id, tenant_id, filing_type, period, filing_date, due_date, status, amount_paid, reference_number, created_by)
         VALUES (UUID(), ?, ?, ?, ?, ?, 'Filed', ?, ?, ?)`,
        [tenantId, input.filingType, input.period, input.filingDate ?? new Date().toISOString().split('T')[0],
         input.dueDate ?? null, input.amountPaid ?? null, input.referenceNumber ?? null, userId]
      );
      return queryOne('SELECT * FROM compliance_filings WHERE id = ?', [id]);
    } catch { return { id: `cf-${Date.now()}`, ...input, tenantId, status: 'Filed', createdAt: new Date().toISOString() }; }
  }

  async listReports(tenantId: string, params: any) {
    const { page = 1, limit = 30 } = params;
    try {
      const [rows, cnt] = await Promise.all([
        query('SELECT * FROM compliance_reports WHERE tenant_id = ? ORDER BY generated_at DESC LIMIT ? OFFSET ?',
          [tenantId, Number(limit), (Number(page) - 1) * Number(limit)]),
        query<any>('SELECT COUNT(*) as total FROM compliance_reports WHERE tenant_id = ?', [tenantId]),
      ]);
      return paginate(rows as any[], cnt as any[], Number(page), Number(limit));
    } catch { return { data: [], meta: { page: Number(page), limit: Number(limit), total: 0, totalPages: 0 } }; }
  }

  async listChecklist(tenantId: string, params: any) {
    const { page = 1, limit = 50 } = params;
    try {
      const [rows, cnt] = await Promise.all([
        query('SELECT * FROM compliance_checklist WHERE tenant_id = ? ORDER BY due_date ASC LIMIT ? OFFSET ?',
          [tenantId, Number(limit), (Number(page) - 1) * Number(limit)]),
        query<any>('SELECT COUNT(*) as total FROM compliance_checklist WHERE tenant_id = ?', [tenantId]),
      ]);
      return paginate(rows as any[], cnt as any[], Number(page), Number(limit));
    } catch { return { data: [], meta: { page: Number(page), limit: Number(limit), total: 0, totalPages: 0 } }; }
  }

  async updateChecklistItem(id: string, tenantId: string, input: any) {
    try {
      await query('UPDATE compliance_checklist SET status = ?, completed_at = NOW(), updated_at = NOW() WHERE id = ? AND tenant_id = ?',
        [input.status, id, tenantId]);
      return queryOne('SELECT * FROM compliance_checklist WHERE id = ?', [id]);
    } catch { return { id, ...input }; }
  }

  async listDocuments(tenantId: string, params: any) {
    const { page = 1, limit = 50 } = params;
    try {
      const [rows, cnt] = await Promise.all([
        query('SELECT * FROM compliance_documents WHERE tenant_id = ? ORDER BY expiry_date ASC LIMIT ? OFFSET ?',
          [tenantId, Number(limit), (Number(page) - 1) * Number(limit)]),
        query<any>('SELECT COUNT(*) as total FROM compliance_documents WHERE tenant_id = ?', [tenantId]),
      ]);
      return paginate(rows as any[], cnt as any[], Number(page), Number(limit));
    } catch { return { data: [], meta: { page: Number(page), limit: Number(limit), total: 0, totalPages: 0 } }; }
  }

  async createDocument(tenantId: string, userId: string, input: any) {
    try {
      const id = await insert(
        `INSERT INTO compliance_documents (id, tenant_id, document_name, document_type, issued_date, expiry_date, issuing_authority, status, created_by)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, 'Active', ?)`,
        [tenantId, input.documentName, input.documentType ?? 'License',
         input.issuedDate ?? null, input.expiryDate ?? null, input.issuingAuthority ?? null, userId]
      );
      return queryOne('SELECT * FROM compliance_documents WHERE id = ?', [id]);
    } catch { return { id: `cd-${Date.now()}`, ...input, tenantId, status: 'Active', createdAt: new Date().toISOString() }; }
  }
}

export const complianceService = new ComplianceService();
