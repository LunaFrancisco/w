'use client'

import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, X, FileText, AlertCircle } from 'lucide-react'

interface FileUploadProps {
  maxFiles?: number
  maxSizeInMB?: number
  acceptedTypes?: string[]
  onFilesChange: (files: File[]) => void
  disabled?: boolean
  className?: string
}

interface UploadedFile {
  file: File
  id: string
  progress?: number
  error?: string
}

export default function FileUpload({
  maxFiles = 3,
  maxSizeInMB = 10,
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx'],
  onFilesChange,
  disabled = false,
  className = '',
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSizeInMB * 1024 * 1024) {
      return `El archivo es demasiado grande. Máximo ${maxSizeInMB}MB permitido.`
    }

    // Check file type
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      }
      if (type.includes('*')) {
        const [mainType] = type.split('/')
        return file.type.startsWith(mainType)
      }
      return file.type === type
    })

    if (!isValidType) {
      return 'Tipo de archivo no permitido. Solo se aceptan imágenes, PDF y documentos Word.'
    }

    return null
  }

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
    
    if (files.length + fileArray.length > maxFiles) {
      alert(`Solo puedes subir máximo ${maxFiles} archivos.`)
      return
    }

    const validatedFiles: UploadedFile[] = []
    
    fileArray.forEach(file => {
      const error = validateFile(file)
      validatedFiles.push({
        file,
        id: Math.random().toString(36).substr(2, 9),
        error: error as string,
      })
    })

    const updatedFiles = [...files, ...validatedFiles]
    setFiles(updatedFiles)
    
    // Return only valid files to parent
    const validFiles = updatedFiles
      .filter(f => !f.error)
      .map(f => f.file)
    
    onFilesChange(validFiles)
  }, [files, maxFiles, onFilesChange])

  const removeFile = (id: string) => {
    const updatedFiles = files.filter(f => f.id !== id)
    setFiles(updatedFiles)
    
    const validFiles = updatedFiles
      .filter(f => !f.error)
      .map(f => f.file)
    
    onFilesChange(validFiles)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    if (disabled) return
    
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles)
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card
        className={`
          border-2 border-dashed transition-all duration-200 cursor-pointer
          ${dragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <div className="p-8 text-center">
          <div className={`
            w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center
            ${dragOver ? 'bg-primary text-primary-foreground' : 'bg-muted'}
          `}>
            <Upload className="w-8 h-8" />
          </div>
          
          <h3 className="text-lg font-semibold mb-2">
            Arrastra archivos aquí o haz clic para seleccionar
          </h3>
          
          <p className="text-muted-foreground text-sm mb-4">
            Máximo {maxFiles} archivos, {maxSizeInMB}MB cada uno
          </p>
          
          <p className="text-xs text-muted-foreground">
            Tipos permitidos: Imágenes, PDF, Word
          </p>
          
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation()
              openFileDialog()
            }}
          >
            Seleccionar archivos
          </Button>
        </div>
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileInput}
        className="hidden"
        aria-label="Seleccionar archivos"
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Archivos seleccionados:</h4>
          {files.map(({ file, id, error }) => (
            <Card key={id} className={`p-3 ${error ? 'border-destructive' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                    ${error 
                      ? 'bg-destructive/10 text-destructive' 
                      : 'bg-primary/10 text-primary'
                    }
                  `}>
                    {error ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                    {error && (
                      <p className="text-xs text-destructive mt-1">
                        {error}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(id)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Eliminar ${file.name}`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* File Limit Info */}
      <div className="text-xs text-muted-foreground">
        {files.length}/{maxFiles} archivos seleccionados
      </div>
    </div>
  )
}