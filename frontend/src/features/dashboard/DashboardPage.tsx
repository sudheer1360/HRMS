import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Building2, Clock, CalendarCheck, Banknote, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { employeeService } from '@features/../services/employee.service';
import { organizationService } from '@features/../services/organization.service';
import { attendanceService } from '@features/../services/attendance.service';
import { leaveService } from '@features/../services/leave.service';
import { helpdeskService } from '@features/../services/platform.service';
import { PageHeader } from '@components/ui/PageHeader';

function useDashboardStats() {
  const employees = useQuery({
    queryKey: ['dashboard', 'employees-count'],
    queryFn: async () => {
      const { data } = await employeeService.list({ page: 1, limit: 1 });
      return data?.meta?.total ?? null;
    },
    staleTime: 60_000,
  });

  const companies = useQuery({
    queryKey: ['dashboard', 'companies-count'],
    queryFn: async () => {
      const { data } = await organizationService.listCompanies({ page: 1, limit: 1, status: 'Active' });
      return data?.meta?.total ?? null;
    },
    staleTime: 60_000,
  });

  const todayPresent = useQuery({
    queryKey: ['dashboard', 'today-present'],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await attendanceService.getDailySummary(today);
      return data?.data?.present ?? null;
    },
    staleTime: 60_000,
  });

  const pendingLeaves = useQuery({
    queryKey: ['dashboard', 'pending-leaves'],
    queryFn: async () => {
      const { data } = await leaveService.list({ status: 'Pending', page: 1, limit: 1 });
      return data?.meta?.total ?? null;
    },
    staleTime: 60_000,
  });

  const openTickets = useQuery({
    queryKey: ['dashboard', 'open-tickets'],
    queryFn: async () => {
      const { data } = await helpdeskService.listTickets({ status: 'Open', page: 1, limit: 1 });
      return data?.meta?.total ?? null;
    },
    staleTime: 60_000,
  });

  return { employees, companies, todayPresent, pendingLeaves, openTickets };
}

function fmt(value: number | null | undefined, loading: boolean): string {
  if (loading) return '…';
  if (value === null || value === undefined) return '—';
  return value.toLocaleString('en-IN');
}

export default function DashboardPage() {
  const { employees, companies, todayPresent, pendingLeaves, openTickets } = useDashboardStats();

  const stats = [
    {
      label: 'Total Employees',
      value: fmt(employees.data, employees.isLoading),
      icon: Users,
      color: 'bg-blue-500',
      path: '/employees',
    },
    {
      label: 'Active Companies',
      value: fmt(companies.data, companies.isLoading),
      icon: Building2,
      color: 'bg-green-500',
      path: '/organization/companies',
    },
    {
      label: 'Today Present',
      value: fmt(todayPresent.data, todayPresent.isLoading),
      icon: Clock,
      color: 'bg-purple-500',
      path: '/attendance',
    },
    {
      label: 'Pending Leaves',
      value: fmt(pendingLeaves.data, pendingLeaves.isLoading),
      icon: CalendarCheck,
      color: 'bg-yellow-500',
      path: '/leave',
    },
    {
      label: 'Payroll Due',
      value: '—',
      icon: Banknote,
      color: 'bg-red-500',
      path: '/payroll',
    },
    {
      label: 'Open Tickets',
      value: fmt(openTickets.data, openTickets.isLoading),
      icon: AlertCircle,
      color: 'bg-orange-500',
      path: '/helpdesk',
    },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Welcome to the Enterprise HRMS Platform" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              to={stat.path}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1 tabular-nums">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon size={20} className="text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="/employees/new" className="p-3 bg-primary/5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 text-center">
            Add Employee
          </Link>
          <Link to="/organization/companies" className="p-3 bg-green-50 rounded-lg text-sm font-medium text-green-700 hover:bg-green-100 text-center">
            Setup Company
          </Link>
          <Link to="/attendance" className="p-3 bg-purple-50 rounded-lg text-sm font-medium text-purple-700 hover:bg-purple-100 text-center">
            View Attendance
          </Link>
          <Link to="/leave" className="p-3 bg-yellow-50 rounded-lg text-sm font-medium text-yellow-700 hover:bg-yellow-100 text-center">
            Manage Leave
          </Link>
        </div>
      </div>
    </div>
  );
}
