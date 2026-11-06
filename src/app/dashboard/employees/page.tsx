"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Upload } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  position: string;
  photoUrl?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function EmployeesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Employee>>({});
  const [newForm, setNewForm] = useState({ name: "", position: "", photoUrl: "", order: 1 });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees");
      const data = await response.json();
      
      if (data.success) {
        setEmployees(data.data);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data pegawai",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newForm.name.trim() || !newForm.position.trim()) {
      toast({
        title: "Error",
        description: "Nama dan jabatan harus diisi",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newForm)
      });

      const data = await response.json();

      if (data.success) {
        await fetchEmployees();
        setNewForm({ name: "", position: "", photoUrl: "", order: employees.length + 1 });
        setIsAdding(false);
        toast({
          title: "Berhasil",
          description: "Pegawai berhasil ditambahkan"
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error adding employee:", error);
      toast({
        title: "Error",
        description: "Gagal menambahkan pegawai",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (employee: Employee) => {
    setIsEditing(employee.id);
    setEditForm(employee);
  };

  const handleUpdate = async () => {
    if (!editForm.name?.trim() || !editForm.position?.trim()) {
      toast({
        title: "Error",
        description: "Nama dan jabatan harus diisi",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`/api/employees/${isEditing}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();

      if (data.success) {
        await fetchEmployees();
        setIsEditing(null);
        setEditForm({});
        toast({
          title: "Berhasil",
          description: "Data pegawai berhasil diperbarui"
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      toast({
        title: "Error",
        description: "Gagal memperbarui data pegawai",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pegawai ${name}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (data.success) {
        await fetchEmployees();
        toast({
          title: "Berhasil",
          description: "Pegawai berhasil dihapus"
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus pegawai",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Memuat data pegawai...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali ke Dashboard</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Kelola Pegawai Desa
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Tambah, edit, dan kelola data pegawai desa
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              setIsAdding(true);
              setNewForm({ name: "", position: "", photoUrl: "", order: employees.length + 1 });
            }}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Pegawai</span>
          </Button>
        </div>

        {/* Add New Employee Form */}
        {isAdding && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tambah Pegawai Baru</CardTitle>
              <CardDescription>
                Isi form di bawah untuk menambahkan pegawai baru
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-name">Nama Lengkap</Label>
                  <Input
                    id="new-name"
                    value={newForm.name}
                    onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div>
                  <Label htmlFor="new-position">Jabatan</Label>
                  <Input
                    id="new-position"
                    value={newForm.position}
                    onChange={(e) => setNewForm({ ...newForm, position: e.target.value })}
                    placeholder="Masukkan jabatan"
                  />
                </div>
                <div>
                  <Label htmlFor="new-photo">URL Foto</Label>
                  <Input
                    id="new-photo"
                    value={newForm.photoUrl}
                    onChange={(e) => setNewForm({ ...newForm, photoUrl: e.target.value })}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="new-order">Urutan</Label>
                  <Input
                    id="new-order"
                    type="number"
                    value={newForm.order}
                    onChange={(e) => setNewForm({ ...newForm, order: parseInt(e.target.value) || 1 })}
                    min="1"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <Button onClick={handleAdd} className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>Simpan</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAdding(false)}
                  className="flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Batal</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Employees List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <Card key={employee.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Photo */}
                <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  {employee.photoUrl ? (
                    <img
                      src={employee.photoUrl}
                      alt={employee.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Tidak ada foto</p>
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-4">
                  {isEditing === employee.id ? (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`edit-name-${employee.id}`}>Nama</Label>
                        <Input
                          id={`edit-name-${employee.id}`}
                          value={editForm.name || ""}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-position-${employee.id}`}>Jabatan</Label>
                        <Input
                          id={`edit-position-${employee.id}`}
                          value={editForm.position || ""}
                          onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-photo-${employee.id}`}>URL Foto</Label>
                        <Input
                          id={`edit-photo-${employee.id}`}
                          value={editForm.photoUrl || ""}
                          onChange={(e) => setEditForm({ ...editForm, photoUrl: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-order-${employee.id}`}>Urutan</Label>
                        <Input
                          id={`edit-order-${employee.id}`}
                          type="number"
                          value={editForm.order || 1}
                          onChange={(e) => setEditForm({ ...editForm, order: parseInt(e.target.value) || 1 })}
                          min="1"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={handleUpdate}
                          className="flex items-center space-x-1"
                        >
                          <Save className="h-3 w-3" />
                          <span>Simpan</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(null);
                            setEditForm({});
                          }}
                          className="flex items-center space-x-1"
                        >
                          <X className="h-3 w-3" />
                          <span>Batal</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                        {employee.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {employee.position}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">
                        Urutan: {employee.order}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(employee)}
                          className="flex items-center space-x-1"
                        >
                          <Edit className="h-3 w-3" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(employee.id, employee.name)}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Hapus</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {employees.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Belum ada data pegawai
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Mulai dengan menambahkan pegawai pertama
              </p>
              <Button
                onClick={() => {
                  setIsAdding(true);
                  setNewForm({ name: "", position: "", photoUrl: "", order: 1 });
                }}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Pegawai</span>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}