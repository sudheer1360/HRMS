import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { config } from './config/index.js';
import { requestId, errorHandler } from './middleware/errorHandler.js';
import { tenantResolver } from './middleware/tenant.js';
import logger from './config/logger.js';

// Import routes
import authRoutes from './modules/auth/auth.routes.js';
import organizationRoutes from './modules/organization/organization.routes.js';
import employeeRoutes from './modules/employee/employee.routes.js';
import attendanceRoutes from './modules/attendance/attendance.routes.js';
import leaveRoutes from './modules/leave/leave.routes.js';
import shiftRoutes from './modules/shift/shift.routes.js';
import policyRoutes from './modules/policy/policy.routes.js';
import recruitmentRoutes from './modules/recruitment/recruitment.routes.js';
import payrollRoutes from './modules/payroll/payroll.routes.js';
import operationsRoutes from './modules/operations/operations.routes.js';
import platformRoutes from './modules/platform/platform.routes.js';
import extendedRoutes from './modules/formbuilder/formbuilder.routes.js';
import performanceRoutes from './modules/performance/performance.routes.js';
import travelRoutes from './modules/travel/travel.routes.js';
import complianceRoutes from './modules/compliance/compliance.routes.js';
import compensationRoutes from './modules/compensation/compensation.routes.js';

const app = express();

// ─── Global Middleware ──────────────────────────────────────────

// Request ID
app.use(requestId);

// Security
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || config.corsOrigin.includes('*') || config.corsOrigin.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id', 'X-Request-ID'],
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
app.use(morgan('short'));

// Rate limiting
app.use(
  rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_ERROR',
        message: 'Too many requests, please try again later.',
      },
    },
  })
);

// Tenant context
app.use(tenantResolver);

// ─── Health Check ──────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

// ─── API Routes ────────────────────────────────────────────────

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/organization', organizationRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/leaves', leaveRoutes);
app.use('/api/v1/shifts', shiftRoutes);
app.use('/api/v1/policies', policyRoutes);
app.use('/api/v1/recruitment', recruitmentRoutes);
app.use('/api/v1/payroll', payrollRoutes);
app.use('/api/v1/operations', operationsRoutes);
app.use('/api/v1/platform', platformRoutes);
app.use('/api/v1/extended', extendedRoutes);
app.use('/api/v1/performance', performanceRoutes);
app.use('/api/v1/travel', travelRoutes);
app.use('/api/v1/compliance', complianceRoutes);
app.use('/api/v1/compensation', compensationRoutes);

// ─── 404 Handler ───────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found',
    },
  });
});

// ─── Global Error Handler ───────────────────────────────────────

app.use(errorHandler);

export default app;
