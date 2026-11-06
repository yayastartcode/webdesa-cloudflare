"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MessageSquare, Phone, Calendar, User, Filter, Eye, Edit } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface HelpdeskEntry {
  id: string;
  nama: string;
  nomorWhatsapp: string;
  kategoriPengaduan: string;
  pesanPengaduan: string;
  status: string;
  response?: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const HelpdeskDashboard = () => {
  const [helpdesks, setHelpdesks] = useState<HelpdeskEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [kategoriFilter, setKategoriFilter] = useState<string>("");
  const [selectedEntry, setSelectedEntry] = useState<HelpdeskEntry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [updateData, setUpdateData] = useState({ status: "", response: "" });

  const fetchHelpdesks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (statusFilter) params.append("status", statusFilter);
      if (kategoriFilter) params.append("kategori", kategoriFilter);

      const response = await fetch(`/api/helpdesk?${params}`);
      const data = await response.json();
      
      setHelpdesks(data.helpdesks);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching helpdesks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHelpdesks();
  }, [pagination.page, statusFilter, kategoriFilter]);

  const handleStatusUpdate = async () => {
    if (!selectedEntry) return;

    try {
      const response = await fetch(`/api/helpdesk/${selectedEntry.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setIsUpdateOpen(false);
        fetchHelpdesks();
        setUpdateData({ status: "", response: "" });
      }
    } catch (error) {
      console.error("Error updating helpdesk:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", variant: "secondary" as const },
      in_progress: { label: "In Progress", variant: "default" as const },
      resolved: { label: "Resolved", variant: "default" as const },
      closed: { label: "Closed", variant: "outline" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getKategoriBadge = (kategori: string) => {
    const kategoriConfig = {
      umum: { label: "Umum", className: "bg-blue-100 text-blue-800" },
      kesehatan: { label: "Kesehatan", className: "bg-green-100 text-green-800" },
      keamanan: { label: "Keamanan", className: "bg-red-100 text-red-800" },
      kebersihan: { label: "Kebersihan", className: "bg-yellow-100 text-yellow-800" },
    };

    const config = kategoriConfig[kategori as keyof typeof kategoriConfig];
    return (
      <Badge className={config?.className || "bg-gray-100 text-gray-800"}>
        {config?.label || kategori}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Manajemen Helpdesk
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Kelola pengaduan dan pertanyaan dari masyarakat
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="kategori-filter">Kategori</Label>
              <Select value={kategoriFilter} onValueChange={setKategoriFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Kategori</SelectItem>
                  <SelectItem value="umum">Umum</SelectItem>
                  <SelectItem value="kesehatan">Kesehatan</SelectItem>
                  <SelectItem value="keamanan">Keamanan</SelectItem>
                  <SelectItem value="kebersihan">Kebersihan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Helpdesk List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengaduan</CardTitle>
          <CardDescription>
            Total: {pagination.total} pengaduan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Memuat data...</p>
            </div>
          ) : helpdesks.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada pengaduan ditemukan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {helpdesks.map((helpdesk) => (
                <div
                  key={helpdesk.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-500" />
                      <div>
                        <h3 className="font-semibold">{helpdesk.nama}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Phone className="h-4 w-4" />
                          <span>{helpdesk.nomorWhatsapp}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getKategoriBadge(helpdesk.kategoriPengaduan)}
                      {getStatusBadge(helpdesk.status)}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                    {helpdesk.pesanPengaduan}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(helpdesk.createdAt), "dd MMMM yyyy, HH:mm", {
                          locale: id,
                        })}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedEntry(helpdesk)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Detail
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detail Pengaduan</DialogTitle>
                            <DialogDescription>
                              Informasi lengkap pengaduan dari {selectedEntry?.nama}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedEntry && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Nama</Label>
                                  <p className="font-medium">{selectedEntry.nama}</p>
                                </div>
                                <div>
                                  <Label>Nomor WhatsApp</Label>
                                  <p className="font-medium">{selectedEntry.nomorWhatsapp}</p>
                                </div>
                                <div>
                                  <Label>Kategori</Label>
                                  <div className="mt-1">
                                    {getKategoriBadge(selectedEntry.kategoriPengaduan)}
                                  </div>
                                </div>
                                <div>
                                  <Label>Status</Label>
                                  <div className="mt-1">
                                    {getStatusBadge(selectedEntry.status)}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <Label>Pesan Pengaduan</Label>
                                <p className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                                  {selectedEntry.pesanPengaduan}
                                </p>
                              </div>
                              {selectedEntry.response && (
                                <div>
                                  <Label>Tanggapan</Label>
                                  <p className="mt-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                    {selectedEntry.response}
                                  </p>
                                </div>
                              )}
                              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                                <div>
                                  <Label>Dibuat</Label>
                                  <p>{format(new Date(selectedEntry.createdAt), "dd MMMM yyyy, HH:mm", { locale: id })}</p>
                                </div>
                                <div>
                                  <Label>Diperbarui</Label>
                                  <p>{format(new Date(selectedEntry.updatedAt), "dd MMMM yyyy, HH:mm", { locale: id })}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              setSelectedEntry(helpdesk);
                              setUpdateData({
                                status: helpdesk.status,
                                response: helpdesk.response || ""
                              });
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Update
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Status Pengaduan</DialogTitle>
                            <DialogDescription>
                              Perbarui status dan berikan tanggapan untuk pengaduan ini
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="status">Status</Label>
                              <Select value={updateData.status} onValueChange={(value) => setUpdateData(prev => ({ ...prev, status: value }))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="response">Tanggapan</Label>
                              <Textarea
                                id="response"
                                placeholder="Berikan tanggapan atau solusi..."
                                value={updateData.response}
                                onChange={(e) => setUpdateData(prev => ({ ...prev, response: e.target.value }))}
                                rows={4}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setIsUpdateOpen(false)}>
                                Batal
                              </Button>
                              <Button onClick={handleStatusUpdate}>
                                Simpan
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpdeskDashboard;