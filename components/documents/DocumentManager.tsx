"use client"

import { useState, useEffect, useRef } from "react"
import {
  Folder,
  File,
  Plus,
  Trash2,
  Eye,
  Download,
  Loader2,
  Upload,
  X,
  MoreVertical,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DocumentPreviewModal } from "@/components/documents/DocumentPreviewModal"

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
  icon?: string
  color?: string
  description?: string
  isDefault: boolean
  createdAt: string
  documents: Document[]
}

interface DocumentManagerProps {
  clientId?: string // Para contadora ver documentos de um cliente específico
}

const documentTypeConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  NFE: { label: 'NF-e', variant: 'default' },
  NFSE: { label: 'NFS-e', variant: 'default' },
  RECEIPT: { label: 'Recibo', variant: 'secondary' },
  CONTRACT: { label: 'Contrato', variant: 'outline' },
  BANK_STATEMENT: { label: 'Comp. Bancário', variant: 'secondary' },
  STATEMENT: { label: 'Declaração', variant: 'outline' },
  OTHER: { label: 'Outros', variant: 'outline' },
}

export default function DocumentManager({ clientId }: DocumentManagerProps) {
  const [folders, setFolders] = useState<FolderType[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [newFolderType, setNewFolderType] = useState("OUTROS")
  const [newFolderIcon, setNewFolderIcon] = useState("")
  const [newFolderColor, setNewFolderColor] = useState("#8b5cf6")
  const [newFolderDescription, setNewFolderDescription] = useState("")

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
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)

  useEffect(() => {
    fetchFolders()
  }, [clientId])

  const fetchFolders = async () => {
    try {
      setIsLoading(true)

      // Se tem clientId, é a contadora vendo documentos do cliente
      // Senão, é o cliente vendo seus próprios documentos
      const endpoint = clientId
        ? `${process.env.NEXT_PUBLIC_API_URL}/document-folders/client/${clientId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/document-folders`

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
    if (!newFolderName.trim()) {
      toast.error('Digite um nome para a pasta')
      return
    }

    try {
      const body: any = {
        name: newFolderName,
        type: newFolderType,
      }

      // Se estiver criando para um cliente específico (contador)
      if (clientId) {
        body.clientId = clientId
      }

      // Campos opcionais
      if (newFolderIcon) body.icon = newFolderIcon
      if (newFolderColor) body.color = newFolderColor
      if (newFolderDescription) body.description = newFolderDescription

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/document-folders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao criar pasta')
      }

      toast.success('Pasta criada com sucesso')
      setNewFolderName("")
      setNewFolderType("OUTROS")
      setNewFolderIcon("")
      setNewFolderColor("#8b5cf6")
      setNewFolderDescription("")
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

    // Encontrar a pasta para mostrar no dialog de confirmação
    const folder = folders.find((f) => f.id === folderId)
    if (!folder) return

    // Confirmar exclusão
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a pasta "${folder.name}"?` +
      (folder.documents.length > 0
        ? `\n\nEsta pasta contém ${folder.documents.length} documento(s) que serão movidos para "Outros".`
        : '')
    )

    if (!confirmed) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/document-folders/${folderId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao deletar pasta')
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/${documentId}`, {
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
        ? `${process.env.NEXT_PUBLIC_API_URL}/documents/${doc.id}/download`
        : `${process.env.NEXT_PUBLIC_API_URL}/documents/me/${doc.id}/download`

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
    setSelectedDocumentId(doc.id)
    setIsPreviewModalOpen(true)
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
        ? `${process.env.NEXT_PUBLIC_API_URL}/documents`
        : `${process.env.NEXT_PUBLIC_API_URL}/documents/me`

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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pastas</CardTitle>
                <CardDescription>Organizadas por categoria</CardDescription>
              </div>
              <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nova
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Criar Nova Pasta</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="folder-name">Nome da Pasta *</Label>
                      <Input
                        id="folder-name"
                        placeholder="Digite o nome da pasta"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        className="!h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="folder-type">Tipo da Pasta *</Label>
                      <Select value={newFolderType} onValueChange={setNewFolderType}>
                        <SelectTrigger className="!h-10">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NOTAS_FISCAIS">Notas Fiscais</SelectItem>
                          <SelectItem value="CONTRATOS">Contratos</SelectItem>
                          <SelectItem value="DECLARACOES">Declarações</SelectItem>
                          <SelectItem value="COMPROVANTES">Comprovantes</SelectItem>
                          <SelectItem value="BALANCETES">Balancetes</SelectItem>
                          <SelectItem value="OUTROS">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="folder-icon">Ícone (emoji)</Label>
                        <Input
                          id="folder-icon"
                          placeholder="📁"
                          value={newFolderIcon}
                          onChange={(e) => setNewFolderIcon(e.target.value)}
                          maxLength={2}
                          className="!h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="folder-color">Cor</Label>
                        <Input
                          id="folder-color"
                          type="color"
                          value={newFolderColor}
                          onChange={(e) => setNewFolderColor(e.target.value)}
                          className="!h-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="folder-description">Descrição (opcional)</Label>
                      <Textarea
                        id="folder-description"
                        placeholder="Descreva o conteúdo desta pasta"
                        value={newFolderDescription}
                        onChange={(e) => setNewFolderDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={createFolder}>
                      Criar Pasta
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {folders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Folder className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma pasta encontrada</h3>
                <p className="text-sm text-muted-foreground">
                  {!clientId && 'Crie uma pasta para organizar seus documentos'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className={`group cursor-pointer rounded-lg border p-3 transition-colors hover:bg-accent ${
                      selectedFolder === folder.id ? "bg-accent ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedFolder(folder.id)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Bolinha colorida */}
                        <div
                          className="h-3 w-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: folder.color || '#8b5cf6' }}
                        />
                        {folder.icon ? (
                          <span className="text-lg flex-shrink-0">{folder.icon}</span>
                        ) : (
                          <Folder className="h-5 w-5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{folder.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {folder.documents.length} documento{folder.documents.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      {!folder.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteFolder(folder.id, folder.isDefault)
                          }}
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Excluir pasta"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content - Documents */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Documentos</CardTitle>
                <CardDescription>
                  {selectedFolder
                    ? folders.find((f) => f.id === selectedFolder)?.name
                    : 'Selecione uma pasta para visualizar'}
                </CardDescription>
              </div>
              {selectedFolder && (
                <Button onClick={openUploadModal} size="sm" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Enviar Documento
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {!selectedFolder ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Folder className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecione uma pasta</h3>
                <p className="text-sm text-muted-foreground">
                  Escolha uma pasta na lista ao lado para visualizar os documentos
                </p>
              </div>
            ) : getFolderDocuments(selectedFolder).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum documento</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Esta pasta está vazia
                </p>
                <Button onClick={openUploadModal} size="sm" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Enviar Primeiro Documento
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data de Envio</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFolderDocuments(selectedFolder).map((doc) => {
                    const typeConfig = documentTypeConfig[doc.type] || documentTypeConfig.OTHER

                    return (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <File className="h-5 w-5 text-muted-foreground" />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">{doc.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {doc.fileName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={typeConfig.variant}>
                            {typeConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(doc.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Ações</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => viewDocumentDetails(doc)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => downloadDocument(doc)}>
                                <Download className="mr-2 h-4 w-4" />
                                Baixar
                              </DropdownMenuItem>
                              {!clientId && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => deleteDocument(doc.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
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
                <SelectTrigger className={`!h-10 w-full ${errors.folder ? 'border-destructive' : ''}`}>
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
                <SelectTrigger className={`!h-10 w-full ${errors.type ? 'border-destructive' : ''}`}>
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
                className="!h-10"
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

      <DocumentPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false)
          setSelectedDocumentId(null)
        }}
        documentId={selectedDocumentId}
        onDelete={() => {
          setIsPreviewModalOpen(false)
          setSelectedDocumentId(null)
          fetchFolders()
        }}
      />
    </div>
  )
}


