import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Badge, Spinner, Input, Select } from '@components/ui/Input';
import { PageHeader } from '@components/ui/PageHeader';
import { ConfirmDialog } from '@components/ui/ConfirmDialog';
import { useToast } from '@components/ui/Toast';
import { formatDate, cn } from '@lib/utils';
import api from '@lib/axios';
import type { Employee, PaginatedResponse } from '@types';

export default function EmployeeListPage() {
  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast, toastError } = useToast();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/employees/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast('Employee deleted successfully');
      setConfirmDeleteId(null);
    },
    onError: () => {
      toastError('Failed to delete employee');
      setConfirmDeleteId(null);
    },
  });

  // Debounce: update the query key only 350ms after the user stops typing
  React.useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['employees', page, search, status],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const { data } = await api.get<PaginatedResponse<Employee>>(`/employees?${params}`);
      return data;
    },
  });

  const statusVariant = (s: string): 'success' | 'warning' | 'danger' | 'info' | 'default' => {
    switch (s) {
      case 'Active':
      case 'Confirmed': return 'success';
      case 'Probation': return 'info';
      case 'Resigned':
      case 'Exited': return 'danger';
      case 'Suspended': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle="Manage employee records"
        actions={
          <Link to="/employees/new">
            <Button><Plus size={16} /> Add Employee</Button>
          </Link>
        }
      />

      {/* Table card — filters integrated at top (Pattern B) */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, code, email..."
              value={searchInput}
              onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
          <div className="sm:w-48">
            <Select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              options={[
                { value: '', label: 'All Status' },
                { value: 'Active', label: 'Active' },
                { value: 'Probation', label: 'Probation' },
                { value: 'Confirmed', label: 'Confirmed' },
                { value: 'Resigned', label: 'Resigned' },
                { value: 'Terminated', label: 'Terminated' },
                { value: 'Suspended', label: 'Suspended' },
              ]}
            />
          </div>
        </div>
        {isLoading ? (
          <Spinner />
        ) : error ? (
          <div className="p-8 text-center text-danger">
            Failed to load employees. Please try again.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Code</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Department</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Designation</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.data.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-primary">{emp.employeeCode}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium">{emp.fullName}</p>
                          <p className="text-xs text-gray-500">{(emp as any).employmentType ?? emp.employeeType}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{emp.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{(emp as any).departmentName ?? emp.department?.departmentName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{(emp as any).designationName ?? emp.designation?.designationName}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant(emp.employmentStatus)}>
                          {emp.employmentStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Link to={`/employees/${emp.id}`} className="p-1.5 rounded hover:bg-gray-100" aria-label="View" title="View">
                            <Eye size={14} />
                          </Link>
                          <Link to={`/employees/${emp.id}/edit`} className="p-1.5 rounded hover:bg-gray-100" aria-label="Edit" title="Edit">
                            <Edit size={14} />
                          </Link>
                          <button
                            className="p-1.5 rounded hover:bg-red-50 text-red-500"
                            aria-label="Delete"
                            title="Delete"
                            onClick={() => setConfirmDeleteId(emp.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!data?.data || data.data.length === 0) && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data?.meta && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Showing {((data.meta.page - 1) * data.meta.limit) + 1} to{' '}
                  {Math.min(data.meta.page * data.meta.limit, data.meta.total)} of {data.meta.total}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!data.meta.hasPrev}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!data.meta.hasNext}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This action cannot be undone."
        onConfirm={() => confirmDeleteId && deleteMutation.mutate(confirmDeleteId)}
        onClose={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
