'use client'

import { Grid3X3, Table, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export type ViewType = 'grid' | 'table'

interface UserViewToggleProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
  totalUsers?: number
  filteredUsers?: number
}

export default function UserViewToggle({ 
  currentView, 
  onViewChange, 
  totalUsers = 0, 
  filteredUsers = 0 
}: UserViewToggleProps) {
  const router = useRouter()

  // Persist view preference
  useEffect(() => {
    localStorage.setItem('userViewPreference', currentView)
  }, [currentView])

  const handleAddUser = () => {
    router.push('/admin/usuarios/nuevo')
  }

  return (
    <div className="flex items-center justify-between w-full">
      {/* Left side - Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">
            {filteredUsers === totalUsers 
              ? `${totalUsers} usuarios`
              : `${filteredUsers} de ${totalUsers} usuarios`
            }
          </span>
          {filteredUsers !== totalUsers && (
            <Badge variant="secondary" className="text-xs">
              Filtrados
            </Badge>
          )}
        </div>
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center gap-3">
        {/* Add User Button */}
        <Button 
          onClick={handleAddUser}
          className="bg-orange-600 hover:bg-orange-700 text-white"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Usuario
        </Button>

        {/* View Toggle */}
        <div className="flex items-center border rounded-lg p-1 bg-gray-50">
          <Button
            variant={currentView === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('grid')}
            className="h-8 px-3"
          >
            <Grid3X3 className="w-4 h-4" />
            <span className="ml-1 hidden sm:inline">Grid</span>
          </Button>
          <Button
            variant={currentView === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('table')}
            className="h-8 px-3"
          >
            <Table className="w-4 h-4" />
            <span className="ml-1 hidden sm:inline">Tabla</span>
          </Button>
        </div>
      </div>
    </div>
  )
}