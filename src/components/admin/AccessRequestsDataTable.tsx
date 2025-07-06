'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown, ChevronUp, Eye, FileText, Calendar, User, Mail, Clock, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import AccessRequestActions from '@/components/AccessRequestActions'

interface AccessRequest {
  id: string
  status: string
  createdAt: string
  processedAt?: string
  adminNotes?: string
  documents?: Array<{
    key: string
    url: string
    filename: string
    contentType: string
    size: number
  }>
  user: {
    id: string
    name: string
    email: string
    image?: string
  }
  processor?: {
    name: string
  }
}

interface AccessRequestsDataTableProps {
  requests: AccessRequest[]
  onUpdate: () => void
}

export function AccessRequestsDataTable({ requests, onUpdate }: AccessRequestsDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pageSize, setPageSize] = useState(10)

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { 
        label: 'Pendiente', 
        variant: 'default' as const,
        className: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: <Clock className="h-3 w-3" />
      },
      APPROVED: { 
        label: 'Aprobada', 
        variant: 'default' as const,
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="h-3 w-3" />
      },
      REJECTED: { 
        label: 'Rechazada', 
        variant: 'destructive' as const,
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: <XCircle className="h-3 w-3" />
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { label: status, variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800 border-gray-200', icon: null }

    return (
      <Badge variant={config.variant} className={`${config.className} border font-medium flex items-center gap-1`}>
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  const columns: ColumnDef<AccessRequest>[] = [
    {
      id: 'user_name',
      accessorFn: (row) => row.user.name,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 p-0 hover:bg-transparent"
          >
            <User className="h-4 w-4 mr-2" />
            Usuario
            {column.getIsSorted() === 'asc' ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => {
        const request = row.original
        return (
          <div className="flex items-center space-x-3">
            {request.user.image && (
              <Avatar className="h-8 w-8">
                <img
                  src={request.user.image}
                  alt={request.user.name}
                  className="h-8 w-8 rounded-full"
                />
              </Avatar>
            )}
            <div>
              <div className="font-medium">{request.user.name}</div>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {request.user.email}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 p-0 hover:bg-transparent"
          >
            Estado
            {column.getIsSorted() === 'asc' ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => getStatusBadge(row.getValue('status')),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 p-0 hover:bg-transparent"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Fecha Solicitud
            {column.getIsSorted() === 'asc' ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'))
        return (
          <div className="text-sm">
            <div className="font-medium">
              {date.toLocaleDateString('es-CL', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
            <div className="text-gray-500">
              {date.toLocaleTimeString('es-CL', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'documents',
      header: 'Documentos',
      cell: ({ row }) => {
        const documents = row.original.documents || []
        return (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="text-sm">
              {documents.length} archivo{documents.length !== 1 ? 's' : ''}
            </span>
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const request = row.original
        return (
          <div className="flex items-center gap-2">
            <Link href={`/admin/solicitudes/${request.id}`}>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                Ver
              </Button>
            </Link>
            {request.status === 'PENDING' && (
              <AccessRequestActions 
                requestId={request.id} 
                onUpdate={onUpdate}
                compact
              />
            )}
          </div>
        )
      },
    },
  ]

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageSize,
  })

  // Update pagination state when pageSize changes
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      pageSize: pageSize
    }))
  }, [pageSize])

  const table = useReactTable({
    data: requests,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      pagination,
    },
  })

  const statusFilter = (table.getColumn('status')?.getFilterValue() as string) ?? ''

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre de usuario..."
                value={(table.getColumn('user_name')?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                  table.getColumn('user_name')?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  table.getColumn('status')?.setFilterValue(value === 'all' ? '' : value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="APPROVED">Aprobada</SelectItem>
                  <SelectItem value="REJECTED">Rechazada</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value))
                }}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 filas</SelectItem>
                  <SelectItem value="10">10 filas</SelectItem>
                  <SelectItem value="20">20 filas</SelectItem>
                  <SelectItem value="50">50 filas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Solicitudes de Acceso ({table.getFilteredRowModel().rows.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className="hover:bg-gray-50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No se encontraron solicitudes
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              Mostrando {pagination.pageIndex * pagination.pageSize + 1} - {Math.min((pagination.pageIndex + 1) * pagination.pageSize, table.getFilteredRowModel().rows.length)} de {table.getFilteredRowModel().rows.length} solicitudes
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Anterior
              </Button>
              <div className="flex items-center gap-1">
                <span className="text-sm">
                  Página {pagination.pageIndex + 1} de{' '}
                  {table.getPageCount()}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}