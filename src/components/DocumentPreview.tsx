'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Eye, FileText, Image } from 'lucide-react'

interface DocumentPreviewProps {
  document: {
    key: string
    url: string
    filename: string
    contentType: string
    size: number
  }
  className?: string
}

export default function DocumentPreview({ document, className }: DocumentPreviewProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) return <Image className="h-5 w-5" />
    if (contentType === 'application/pdf') return <FileText className="h-5 w-5" />
    if (contentType.includes('word')) return <FileText className="h-5 w-5" />
    return <FileText className="h-5 w-5" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const canPreview = document.contentType.startsWith('image/') || document.contentType === 'application/pdf'

  const handleDownload = () => {
    const link = window.document.createElement('a')
    link.href = `/api/documents/${encodeURIComponent(document.key)}/download`
    link.download = document.filename
    window.document.body.appendChild(link)
    link.click()
    window.document.body.removeChild(link)
  }

  return (
    <div className={`flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
      {getFileIcon(document.contentType)}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-blue-700 truncate">
          {document.filename}
        </div>
        <div className="text-xs text-blue-500">
          {formatFileSize(document.size)}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {canPreview && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getFileIcon(document.contentType)}
                  {document.filename}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                {document.contentType.startsWith('image/') ? (
                  <img 
                    src={`/api/documents/${encodeURIComponent(document.key)}`}
                    alt={document.filename}
                    className="max-w-full h-auto rounded-lg"
                  />
                ) : document.contentType === 'application/pdf' ? (
                  <iframe
                    src={`/api/documents/${encodeURIComponent(document.key)}`}
                    className="w-full h-[70vh] rounded-lg border"
                    title={document.filename}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Vista previa no disponible para este tipo de archivo
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="h-8 w-8 p-0"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}