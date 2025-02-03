'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Camera, User, Mail, FileText, Upload } from 'lucide-react';
import { FallingStars } from '@/components/FallingStars';

interface ProfileFormData {
  name: string;
  email: string;
  bio: string;
  image: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status, update } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin');
    },
  });

  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    bio: '',
    image: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const userData = await response.json();
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            bio: userData.bio || '',
            image: userData.image || '',
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchUserData();
    }
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, image: data.url }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const dataToUpdate = {
        ...formData,
        image: formData.image || null,
        bio: formData.bio || '',
      };

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToUpdate),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.errors) {
          data.errors.forEach((error: any) => 
            toast.error(error.message || 'Validation error')
          );
          return;
        }
        throw new Error(data.message || 'Failed to update profile');
      }

      await update({
        ...session,
        user: {
          ...session?.user,
          name: data.name,
          email: data.email,
          image: data.image,
          bio: data.bio,
        },
      });

      // Force a hard refresh to update all components
      window.location.reload();
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1c2e] via-[#2d2b55] to-[#3c1f52]">
        <FallingStars />
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-white text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-400 border-r-transparent align-[-0.125em]" />
              <p className="mt-4">Loading your profile...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1c2e] via-[#2d2b55] to-[#3c1f52]">
      <FallingStars />
      <DashboardHeader />
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text mb-2">
              Your Profile
            </h1>
            <p className="text-gray-300">Manage your personal information and preferences</p>
          </div>

          <Card className="backdrop-blur-xl bg-white/5 border border-purple-500/20 transition-all duration-500">
            <CardContent className="p-0">
              <div className="relative h-48 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-purple-600/30">
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                  <div className="relative group">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <Avatar 
                      className="w-32 h-32 border-4 border-white/10 shadow-xl cursor-pointer group-hover:border-purple-500/50 transition-all duration-300"
                      onClick={handleImageClick}
                    >
                      <AvatarImage src={formData.image} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl">
                        {formData.name?.charAt(0)?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div 
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
                      onClick={handleImageClick}
                    >
                      <div className="bg-white/5 w-full h-full rounded-full flex items-center justify-center">
                        {isUploading ? (
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-r-transparent" />
                        ) : (
                          <Upload className="w-6 h-6 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-center mt-4 text-sm text-gray-400">Click to upload profile picture</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 mt-16 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm text-gray-300 flex items-center gap-2">
                      <User className="w-4 h-4" /> Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/10 text-white focus:border-purple-500/50 transition-colors"
                      placeholder="Your name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm text-gray-300 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/10 text-white focus:border-purple-500/50 transition-colors"
                      placeholder="Your email"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio" className="text-sm text-gray-300 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Bio
                    </Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/10 text-white focus:border-purple-500/50 transition-colors min-h-[120px]"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 px-8 hover:scale-105 transition-all duration-300"
                  >
                    {isLoading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
} 