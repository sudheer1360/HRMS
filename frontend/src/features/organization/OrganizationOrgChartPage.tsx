import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, ChevronDown, ChevronRight, MapPin, Layers, Search } from 'lucide-react';
import { Spinner } from '@components/ui/Input';
import { getCompanies, getBranches, getDepartments } from './organization.api';
import type { Company, Branch, Department } from '@types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface DeptNode extends Department {
  children: DeptNode[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const DEPT_COLORS = [
  'bg-blue-50 border-blue-200 text-blue-800',
  'bg-purple-50 border-purple-200 text-purple-800',
  'bg-green-50 border-green-200 text-green-800',
  'bg-amber-50 border-amber-200 text-amber-800',
  'bg-rose-50 border-rose-200 text-rose-800',
  'bg-teal-50 border-teal-200 text-teal-800',
  'bg-indigo-50 border-indigo-200 text-indigo-800',
  'bg-orange-50 border-orange-200 text-orange-800',
];

const BRANCH_ICONS: Record<string, string> = {
  office: '🏢',
  plant: '🏭',
  factory: '⚙️',
  warehouse: '📦',
  site: '🏗️',
  HeadOffice: '🏛️',
  RegionalOffice: '🏢',
  BranchOffice: '🏬',
};

function buildDeptTree(departments: Department[], parentId: string | null = null): DeptNode[] {
  return departments
    .filter((d) => (d.parentDepartmentId ?? null) === parentId)
    .map((d) => ({ ...d, children: buildDeptTree(departments, d.id) }));
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DeptCard({
  node,
  colorClass,
  searchTerm,
  depth = 0,
}: {
  node: DeptNode;
  colorClass: string;
  searchTerm: string;
  depth?: number;
}) {
  const [expanded, setExpanded] = React.useState(true);
  const hasChildren = node.children.length > 0;
  const dimmed =
    searchTerm &&
    !node.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !node.departmentCode.toLowerCase().includes(searchTerm.toLowerCase());

  return (
    <div className={depth > 0 ? 'ml-6 border-l-2 border-gray-200 pl-4 mt-2' : ''}>
      <div
        className={`flex items-center gap-2 rounded-xl border px-4 py-3 shadow-sm transition-all cursor-pointer select-none ${colorClass} ${dimmed ? 'opacity-30' : ''}`}
        onClick={() => hasChildren && setExpanded((v) => !v)}
      >
        <Layers size={14} className="flex-shrink-0 opacity-60" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm leading-tight truncate">{node.departmentName}</div>
          <div className="text-xs opacity-60 font-mono">{node.departmentCode}</div>
        </div>
        {hasChildren && (
          <button className="ml-auto flex-shrink-0 opacity-60">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
        {node.children.length > 0 && (
          <span className="ml-1 rounded-full bg-white/60 px-1.5 py-0.5 text-[10px] font-medium">
            {node.children.length}
          </span>
        )}
      </div>
      {expanded && hasChildren && (
        <div className="mt-1">
          {node.children.map((child, i) => (
            <DeptCard
              key={child.id}
              node={child}
              colorClass={colorClass}
              searchTerm={searchTerm}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BranchPanel({
  branch,
  departments,
  colorOffset,
  searchTerm,
}: {
  branch: Branch;
  departments: Department[];
  colorOffset: number;
  searchTerm: string;
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const branchDepts = departments.filter((d) => !d.branchId || d.branchId === branch.id);
  const rootDepts = buildDeptTree(branchDepts, null);
  const icon = BRANCH_ICONS[branch.branchType] ?? '🏢';

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden w-full">
      {/* Branch Header */}
      <div
        className="flex items-center gap-3 bg-gray-800 px-4 py-3 cursor-pointer select-none"
        onClick={() => setCollapsed((v) => !v)}
      >
        <span className="text-lg">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white leading-tight truncate">{branch.branchName}</div>
          <div className="text-xs text-gray-400 font-mono">{branch.branchCode}</div>
        </div>
        {collapsed ? <ChevronRight size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
      </div>

      {/* Branch Meta */}
      {!collapsed && (
        <>
          <div className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 border-b border-gray-100">
            <MapPin size={12} className="text-gray-400" />
            <span className="text-xs text-gray-500">{[branch.city, branch.state].filter(Boolean).join(', ') || 'Location TBD'}</span>
            {branch.isPayrollLocation && (
              <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">Payroll</span>
            )}
          </div>

          {/* Departments */}
          <div className="p-4 space-y-2">
            {rootDepts.length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-4">No departments assigned</p>
            ) : (
              rootDepts.map((node, i) => (
                <DeptCard
                  key={node.id}
                  node={node}
                  colorClass={DEPT_COLORS[(colorOffset + i) % DEPT_COLORS.length]}
                  searchTerm={searchTerm}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OrganizationOrgChartPage() {
  const [companyId, setCompanyId] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');

  const { data: companies, isLoading: loadingCompanies } = useQuery({
    queryKey: ['organization', 'companies', 'list'],
    queryFn: () => getCompanies({ page: 1, limit: 100 }),
  });

  const defaultCompanyId = companies?.data?.[0]?.id ?? '';
  React.useEffect(() => {
    if (!companyId && defaultCompanyId) setCompanyId(defaultCompanyId);
  }, [defaultCompanyId, companyId]);

  const { data: branches, isLoading: loadingBranches } = useQuery({
    queryKey: ['organization', 'branches', companyId],
    enabled: !!companyId,
    queryFn: () => getBranches(companyId),
  });

  const { data: departments, isLoading: loadingDepts } = useQuery({
    queryKey: ['organization', 'departments', companyId],
    enabled: !!companyId,
    queryFn: () => getDepartments(companyId),
  });

  const selectedCompany: Company | undefined = companies?.data.find((c: Company) => c.id === companyId);
  const displayBranches: Branch[] = branches ?? [];
  const displayDepts: Department[] = departments ?? [];

  const isLoading = loadingCompanies || loadingBranches || loadingDepts;

  // For display: orphan depts (not linked to any branch) go under all branches or a special section
  const unlinkedDepts = displayDepts.filter(
    (d) => !d.branchId || !displayBranches.find((b) => b.id === d.branchId)
  );

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organisation Chart</h1>
          <p className="text-gray-500 mt-1">Visual hierarchy of branches and departments.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 rounded-lg border border-gray-300 bg-white pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-52"
            />
          </div>

          {/* Company selector */}
          {companies?.data?.length > 0 && (
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="h-10 rounded-lg border border-gray-300 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {companies.data.map((c: Company) => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          {/* ── Company Card ── */}
          {selectedCompany && (
            <div className="mb-6 flex items-center gap-4 rounded-2xl border border-gray-200 bg-gradient-to-r from-gray-900 to-gray-700 p-6 shadow-md">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-3xl">
                🏛️
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-white leading-tight">{selectedCompany.companyName}</h2>
                <p className="text-sm text-gray-300 mt-0.5">{selectedCompany.legalName}</p>
              </div>
              <div className="hidden sm:flex items-center gap-6 text-right">
                <div>
                  <div className="text-2xl font-bold text-white">{displayBranches.length}</div>
                  <div className="text-xs text-gray-400 mt-0.5">Branches</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{displayDepts.length}</div>
                  <div className="text-xs text-gray-400 mt-0.5">Departments</div>
                </div>
              </div>
            </div>
          )}

          {/* ── Branches + Departments Grid ── */}
          {displayBranches.length === 0 && displayDepts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-16 text-center">
              <Building2 size={40} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 font-medium">No branches or departments yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Add branches and departments from the sidebar to see them here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Branches with their departments */}
              <div className="rounded-xl">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {displayBranches.map((branch, idx) => (
                    <BranchPanel
                      key={branch.id}
                      branch={branch}
                      departments={displayDepts}
                      colorOffset={idx * 2}
                      searchTerm={searchTerm}
                    />
                  ))}

                  {/* Unlinked departments (not tied to any branch) */}
                  {unlinkedDepts.length > 0 && displayBranches.length > 0 && (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 w-full p-4">
                      <div className="flex items-center gap-2 mb-3 text-gray-500">
                        <Layers size={14} />
                        <span className="text-sm font-medium">Unassigned to Branch</span>
                      </div>
                      <div className="space-y-2">
                        {buildDeptTree(unlinkedDepts, null).map((node, i) => (
                          <DeptCard
                            key={node.id}
                            node={node}
                            colorClass={DEPT_COLORS[i % DEPT_COLORS.length]}
                            searchTerm={searchTerm}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No branches, show departments directly */}
                  {displayBranches.length === 0 && displayDepts.length > 0 && (
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 w-full">
                      <div className="flex items-center gap-2 mb-3 text-gray-700">
                        <Layers size={14} />
                        <span className="text-sm font-medium">Departments</span>
                      </div>
                      <div className="space-y-2">
                        {buildDeptTree(displayDepts, null).map((node, i) => (
                          <DeptCard
                            key={node.id}
                            node={node}
                            colorClass={DEPT_COLORS[i % DEPT_COLORS.length]}
                            searchTerm={searchTerm}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Legend ── */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="font-medium text-gray-700">Legend:</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-800 inline-block" /> Branch</span>
                {DEPT_COLORS.slice(0, 4).map((c, i) => (
                  <span key={i} className={`flex items-center gap-1 rounded-md px-2 py-0.5 border text-[10px] font-medium ${c}`}>
                    {['Engineering', 'HR', 'Finance', 'Sales'][i]}
                  </span>
                ))}
                <span className="text-gray-400 italic">Colors rotate by department order</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
