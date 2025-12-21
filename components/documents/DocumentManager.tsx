"use client"

import { useState, useEffect, useRef } from "react"
import { Folder, File, Plus, ChevronRight, Trash2, Eye, Download, Loader2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

type Document = {
  id: string
  title: string
  fileName: string
  filePath: string
  type: string
  status: string
  createdAt: string
}

type FolderType = {
  id: string
  name: string
  type: string
  isDefault: boolean
  createdAt: string
  documents: Document[]
}

interface DocumentManagerProps {
  clientId?: string // Para contadora ver documentos de um cliente específico
}

export default function DocumentManager({ clientId }: DocumentManagerProps) {
  const [folders, setFolders] = useState<FolderType[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")

  // Upload document state
  const [isUploadDocumentOpen, setIsUploadDocumentOpen] = useState(false)
  const [docTitle, setDocTitle] = useState("")
  const [docType, setDocType] = useState("")
  const [docDescription, setDocDescription] = useState("")
  const [docFile, setDocFile] = useState<File | null>(null)
  const [docFolderId, setDocFolderId] = useState<string>("")
  const [isUploadingDoc, setIsUploadingDoc] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchFolders()
  }, [clientId])

  const fetchFolders = async () => {
    try {
      setIsLoading(true)

      // Se tem clientId, é a contadora vendo documentos do cliente
      // Senão, é o cliente vendo seus próprios documentos
      const endpoint = clientId
        ? `http://localhost:3000/api/documents/client/${clientId}/grouped`
        : `http://localhost:3000/api/documents/me/grouped`

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar pastas e documentos')
      }

      const data = await response.json()
      setFolders(data)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar pastas e documentos')
    } finally {
      setIsLoading(false)
    }
  }

  const createFolder = async () => {
    if (!newFolderName.trim()) return

    try {
      const response = await fetch('http://localhost:3000/api/document-folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          name: newFolderName,
          type: 'CUSTOM',
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao criar pasta')
      }

      toast.success('Pasta criada com sucesso')
      setNewFolderName("")
      setIsCreateFolderOpen(false)
      fetchFolders()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar pasta')
    }
  }

  const deleteFolder = async (folderId: string, isDefault: boolean) => {
    if (isDefault) {
      toast.error('Não é possível deletar pastas padrão')
      return
    }

    try {
      const response = await fetch(`http://localhost:3000/api/document-folders/${folderId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar pasta')
      }

      toast.success('Pasta deletada com sucesso')
      if (selectedFolder === folderId) {
        setSelectedFolder(null)
      }
      fetchFolders()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar pasta')
    }
  }

  const deleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar documento')
      }

      toast.success('Documento deletado com sucesso')
      fetchFolders()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar documento')
    }
  }

  const getFolderDocuments = (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId)
    return folder?.documents || []
  }

  const downloadDocument = async (doc: Document) => {
    try {
      const endpoint = clientId
        ? `http://localhost:3000/api/documents/${doc.id}/download`
        : `http://localhost:3000/api/documents/me/${doc.id}/download`

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Erro ao baixar documento')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = doc.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao baixar documento')
    }
  }

  const viewDocumentDetails = (doc: Document) => {
    // Abre o arquivo em uma nova aba
    window.open(`http://localhost:3000/${doc.filePath}`, '_blank')
  }

  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Tipo de arquivo não permitido. Use PDF, JPG ou PNG.'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Arquivo muito grande (max. 10MB)'
    }
    return null
  }

  const handleFileSelect = (selectedFile: File) => {
    const error = validateFile(selectedFile)
    if (error) {
      setErrors({ ...errors, file: error })
      return
    }

    setDocFile(selectedFile)
    if (!docTitle) {
      setDocTitle(selectedFile.name)
    }
    setErrors({ ...errors, file: '' })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const validateDocumentForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!docType) {
      newErrors.type = 'Selecione o tipo de documento'
    }
    if (!docFile) {
      newErrors.file = 'Selecione um arquivo'
    }
    if (!docFolderId) {
      newErrors.folder = 'Selecione uma pasta'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const resetDocumentForm = () => {
    setDocTitle('')
    setDocType('')
    setDocDescription('')
    setDocFile(null)
    setDocFolderId(selectedFolder || '')
    setErrors({})
    setUploadProgress(0)
  }

  const handleDocumentUpload = async () => {
    if (!validateDocumentForm()) {
      return
    }

    try {
      setIsUploadingDoc(true)
      setUploadProgress(0)

      const formData = new FormData()
      formData.append('file', docFile!)
      formData.append('type', docType)
      formData.append('folderId', docFolderId)
      if (clientId) formData.append('clientId', clientId)
      if (docTitle) formData.append('title', docTitle)
      if (docDescription) formData.append('description', docDescription)

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          toast.success('Documento enviado com sucesso')
          setIsUploadDocumentOpen(false)
          resetDocumentForm()
          fetchFolders()
        } else {
          const response = JSON.parse(xhr.responseText)
          toast.error(response.message || 'Erro ao enviar documento. Tente novamente')
        }
        setIsUploadingDoc(false)
      })

      xhr.addEventListener('error', () => {
        toast.error('Erro de rede ao enviar documento')
        setIsUploadingDoc(false)
      })

      // Use endpoint correto baseado no contexto
      const endpoint = clientId
        ? 'http://localhost:3000/api/documents'
        : 'http://localhost:3000/api/documents/me'

      xhr.open('POST', endpoint)
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('accessToken')}`)
      xhr.send(formData)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar documento')
      setIsUploadingDoc(false)
    }
  }

  const openUploadModal = () => {
    setDocFolderId(selectedFolder || '')
    setIsUploadDocumentOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
        {/* Sidebar - Folders List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-foreground">Pastas</h2>
            {!clientId && (
              <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nova Pasta
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Pasta</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="folder-name">Nome da Pasta</Label>
                      <Input
                        id="folder-name"
                        placeholder="Digite o nome da pasta"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && createFolder()}
                      />
                    </div>
                    <Button onClick={createFolder} className="w-full">
                      Criar Pasta
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="space-y-2">
            {folders.length === 0 ? (
              <Card className="border-dashed p-8 text-center">
                <Folder className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Nenhuma pasta encontrada</p>
              </Card>
            ) : (
              folders.map((folder) => (
                <Card
                  key={folder.id}
                  className={`group cursor-pointer transition-colors hover:bg-accent ${
                    selectedFolder === folder.id ? "bg-accent ring-1 ring-ring" : ""
                  }`}
                  onClick={() => setSelectedFolder(folder.id)}
                >
                  <div className="flex items-center gap-3 p-3">
                    <Folder className="h-5 w-5 text-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{folder.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {folder.documents.length} documento(s)
                      </p>
                    </div>
                    {selectedFolder === folder.id && <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                    {!folder.isDefault && !clientId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteFolder(folder.id, folder.isDefault)
                        }}
                        className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Main Content - Documents */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-foreground">Documentos</h2>
              {selectedFolder && (
                <p className="text-sm text-muted-foreground">{folders.find((f) => f.id === selectedFolder)?.name}</p>
              )}
            </div>
            {selectedFolder && (
              <Button onClick={openUploadModal} size="sm" className="gap-2">
                <Upload className="h-4 w-4" />
                Enviar Documento
              </Button>
            )}
          </div>

          <Card>
            {!selectedFolder ? (
              <div className="p-12 text-center">
                <Folder className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Selecione uma pasta para ver os documentos</p>
              </div>
            ) : getFolderDocuments(selectedFolder).length === 0 ? (
              <div className="p-12 text-center">
                <File className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum documento nesta pasta</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {getFolderDocuments(selectedFolder).map((doc) => (
                  <div key={doc.id} className="group flex items-center gap-3 p-4 hover:bg-accent transition-colors">
                    <File className="h-5 w-5 text-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Criado em {new Date(doc.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewDocumentDetails(doc)}
                        className="h-8 w-8 p-0"
                        title="Visualizar documento"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadDocument(doc)}
                        className="h-8 w-8 p-0"
                        title="Baixar documento"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {!clientId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteDocument(doc.id)}
                          className="h-8 w-8 p-0"
                          title="Excluir documento"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Upload Document Modal */}
      <Dialog open={isUploadDocumentOpen} onOpenChange={(open) => {
        setIsUploadDocumentOpen(open)
        if (!open) resetDocumentForm()
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Enviar Documento</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Pasta */}
            <div className="space-y-2">
              <Label htmlFor="folder">Pasta *</Label>
              <Select value={docFolderId} onValueChange={setDocFolderId} disabled={isUploadingDoc}>
                <SelectTrigger className={errors.folder ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Selecione a pasta" />
                </SelectTrigger>
                <SelectContent>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.folder && (
                <p className="text-sm text-destructive">{errors.folder}</p>
              )}
            </div>

            {/* Tipo de Documento */}
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Documento *</Label>
              <Select value={docType} onValueChange={setDocType} disabled={isUploadingDoc}>
                <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NFE">NF-e (Nota Fiscal Eletrônica)</SelectItem>
                  <SelectItem value="NFSE">NFS-e (Nota Fiscal de Serviço)</SelectItem>
                  <SelectItem value="RECEIPT">Recibo</SelectItem>
                  <SelectItem value="CONTRACT">Contrato</SelectItem>
                  <SelectItem value="BANK_STATEMENT">Comprovante Bancário</SelectItem>
                  <SelectItem value="STATEMENT">Declaração</SelectItem>
                  <SelectItem value="OTHER">Outros</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type}</p>
              )}
            </div>

            {/* Upload de Arquivo */}
            <div className="space-y-2">
              <Label>Arquivo *</Label>
              <div
                className={`
                  relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                  ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
                  ${errors.file ? 'border-destructive' : ''}
                  ${isUploadingDoc ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isUploadingDoc && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileInputChange}
                  disabled={isUploadingDoc}
                />

                {docFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <File className="h-8 w-8 text-primary" />
                      <div className="text-left">
                        <p className="font-medium text-sm">{docFile.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(docFile.size)}</p>
                      </div>
                    </div>
                    {!isUploadingDoc && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDocFile(null)
                          setDocTitle('')
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                    <div className="text-sm">
                      <span className="font-medium text-primary">Clique para selecionar</span>
                      <span className="text-muted-foreground"> ou arraste um arquivo</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      PDF, JPG ou PNG (max. 10MB)
                    </p>
                  </div>
                )}
              </div>
              {errors.file && (
                <p className="text-sm text-destructive">{errors.file}</p>
              )}
            </div>

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">Título (opcional)</Label>
              <Input
                id="title"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="Nome do documento"
                disabled={isUploadingDoc}
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={docDescription}
                onChange={(e) => setDocDescription(e.target.value)}
                placeholder="Adicione uma descrição..."
                rows={3}
                disabled={isUploadingDoc}
              />
            </div>

            {/* Progress Bar */}
            {isUploadingDoc && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Enviando...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDocumentOpen(false)} disabled={isUploadingDoc}>
              Cancelar
            </Button>
            <Button onClick={handleDocumentUpload} disabled={isUploadingDoc}>
              {isUploadingDoc && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
