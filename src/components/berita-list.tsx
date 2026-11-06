"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "@/lib/router-link";

interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    name: string;
    email: string;
  };
}

export default function BeritaList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/posts?limit=3');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const stripHtmlTags = (html: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    const plainText = stripHtmlTags(content);
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  };

  const extractFirstImageFromContent = (htmlContent: string): string | null => {
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      const firstImg = tempDiv.querySelector('img');
      return firstImg ? firstImg.src : null;
    } catch (error) {
      console.error('Error extracting image from content:', error);
      return null;
    }
  };

  const getDisplayImage = (post: Post): string | null => {
    if (post.imageUrl) {
      return post.imageUrl;
    }
    return extractFirstImageFromContent(post.content);
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Berita Terkini</h2>
            <p className="text-gray-600">Informasi terbaru dari Desa Gimpubia</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Berita Terkini</h2>
            <p className="text-gray-600">Informasi terbaru dari Desa Kersik</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">Belum ada berita tersedia</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Berita Terkini</h2>
          <p className="text-gray-600">Informasi terbaru dari Desa Kersik</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white">
              {/* Image */}
              {getDisplayImage(post) && (
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={getDisplayImage(post)!} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <CardContent className="p-4">
                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  <Link href={`/berita/${post.id}`} className="hover:text-red-600 transition-colors">
                    {post.title}
                  </Link>
                </h3>
                
                {/* Content Preview */}
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {truncateContent(post.content, 100)}
                </p>
                
                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>Administrator</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>Dilihat 1.197 kali</span>
                  </div>
                </div>
                
                {/* Date Badge */}
                <div className="flex justify-between items-center">
                  <Badge className="bg-red-600 text-white text-xs px-2 py-1">
                    {formatDate(post.createdAt)}
                  </Badge>
                  <Badge className="bg-red-600 text-white text-xs px-2 py-1">
                    {new Date(post.createdAt).getFullYear()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* View All Button */}
        <div className="text-center">
          <Link href="/berita">
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              Lihat Semua Berita
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}