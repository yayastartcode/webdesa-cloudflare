'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { redirect } from '@/lib/navigation';
import type { Session } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UploadButton } from '@/lib/upload';
import { Trash2, Plus, ArrowUp, ArrowDown } from 'lucide-react';



interface HeroSlide {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  order: number;
}

interface UploadResponse {
  ufsUrl: string;
  [key: string]: any;
}

export default function HeroSlidesPage() {
  const { data: session, status } = useSession() as { data: Session | null; status: string; };
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [newSlide, setNewSlide] = useState({
    title: '',
    description: '',
    imageUrl: '',
    isActive: true
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchSlides = async () => {
    try {
      const response = await fetch('/api/hero-slides');
      if (response.ok) {
        const data = await response.json();
        setSlides(data);
      }
    } catch (error) {
      console.error('Error fetching slides:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  // Redirect if not authenticated or not admin
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || !session.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  const handleAddSlide = async () => {
    if (!newSlide.title || !newSlide.description || !newSlide.imageUrl) {
      setMessage('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/hero-slides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newSlide,
          order: slides.length + 1
        }),
      });

      if (response.ok) {
        setMessage('Slide added successfully!');
        setNewSlide({
          title: '',
          description: '',
          imageUrl: '',
          isActive: true
        });
        setShowAddForm(false);
        fetchSlides();
      } else {
        setMessage('Failed to add slide');
      }
    } catch (error) {
      setMessage('Error adding slide');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSlide = async (slideId: string, updates: Partial<HeroSlide>) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/hero-slides/${slideId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        setMessage('Slide updated successfully!');
        fetchSlides();
      } else {
        setMessage('Failed to update slide');
      }
    } catch (error) {
      setMessage('Error updating slide');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlide = async (slideId: string) => {
    if (!confirm('Are you sure you want to delete this slide?')) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/hero-slides/${slideId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Slide deleted successfully!');
        fetchSlides();
      } else {
        setMessage('Failed to delete slide');
      }
    } catch (error) {
      setMessage('Error deleting slide');
    } finally {
      setSaving(false);
    }
  };

  const moveSlide = async (slideId: string, direction: 'up' | 'down') => {
    const slideIndex = slides.findIndex(s => s.id === slideId);
    if (slideIndex === -1) return;

    const newIndex = direction === 'up' ? slideIndex - 1 : slideIndex + 1;
    if (newIndex < 0 || newIndex >= slides.length) return;

    const newSlides = [...slides];
    [newSlides[slideIndex], newSlides[newIndex]] = [newSlides[newIndex], newSlides[slideIndex]];

    // Update order values
    newSlides.forEach((slide, index) => {
      slide.order = index + 1;
    });

    setSlides(newSlides);

    // Update in database
    try {
      await Promise.all([
        handleUpdateSlide(newSlides[slideIndex].id, { order: newSlides[slideIndex].order }),
        handleUpdateSlide(newSlides[newIndex].id, { order: newSlides[newIndex].order })
      ]);
    } catch (error) {
      console.error('Error updating slide order:', error);
      fetchSlides(); // Revert on error
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">

              <h1 className="text-2xl font-bold text-orange-600">Hero Slides Management</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {message && (
            <Alert className="mb-6">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {/* Add New Slide Button */}
          <div className="mb-6">
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Slide
            </Button>
          </div>

          {/* Add New Slide Form */}
          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Add New Hero Slide</CardTitle>
                <CardDescription>
                  Create a new slide for the hero slider
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-black dark:text-white">Title *</Label>
                  <Input
                    id="title"
                    value={newSlide.title}
                    onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                    placeholder="Enter slide title"
                    className="text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-black dark:text-white">Description *</Label>
                  <Input
                    id="description"
                    value={newSlide.description}
                    onChange={(e) => setNewSlide({ ...newSlide, description: e.target.value })}
                    placeholder="Enter slide description"
                    className="text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="imageUrl" className="text-black dark:text-white">Image *</Label>
                  <div className="mt-2">
                    {newSlide.imageUrl ? (
                      <div className="space-y-2">
                        <img 
                          src={newSlide.imageUrl} 
                          alt="Preview" 
                          className="w-32 h-20 object-cover rounded"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setNewSlide({ ...newSlide, imageUrl: '' })}
                        >
                          Remove Image
                        </Button>
                      </div>
                    ) : (
                      <UploadButton
                        endpoint="imageUploader"
                        onClientUploadComplete={(res: UploadResponse[]) => {
                          if (res?.[0]) {
                            setNewSlide({ ...newSlide, imageUrl: res[0].ufsUrl });
                          }
                        }}
                        onUploadError={(error: Error) => {
                          console.error('Upload error:', error);
                          setMessage('Failed to upload image');
                        }}
                      />
                    )}
                  </div>
                </div>



                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={newSlide.isActive}
                    onChange={(e) => setNewSlide({ ...newSlide, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="isActive" className="text-black dark:text-white">Active</Label>
                </div>

                <div className="flex space-x-2">
                  <Button 
                      onClick={handleAddSlide}
                      disabled={saving}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                    {saving ? 'Adding...' : 'Add Slide'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Slides */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-black dark:text-white">Existing Slides ({slides.length})</h2>
            
            {slides.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-500">No slides found. Add your first slide above.</p>
                </CardContent>
              </Card>
            ) : (
              slides.map((slide, index) => (
                <Card key={slide.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <img 
                        src={slide.imageUrl} 
                        alt={slide.title}
                        className="w-24 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg text-black dark:text-white">{slide.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300">{slide.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                slide.isActive 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                              }`}>
                                {slide.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">Order: {slide.order}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveSlide(slide.id, 'up')}
                              disabled={index === 0}
                              className="text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveSlide(slide.id, 'down')}
                              disabled={index === slides.length - 1}
                              className="text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateSlide(slide.id, { isActive: !slide.isActive })}
                              className="text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                            >
                              {slide.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteSlide(slide.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
