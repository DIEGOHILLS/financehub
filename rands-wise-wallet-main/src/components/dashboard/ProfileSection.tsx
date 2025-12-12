import { useState } from 'react';
import { User, Mail, Edit2, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFinanceStore } from '@/lib/store';
import { ProfileModal } from './ProfileModal';

export function ProfileSection() {
  const { profile } = useFinanceStore();
  const [isEditing, setIsEditing] = useState(false);

  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <>
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">Profile</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-8 gap-1 text-primary hover:text-primary"
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-20 w-20 border-4 border-primary/20">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => setIsEditing(true)}
              className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold">{profile.name}</h3>
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              {profile.email}
            </div>
          </div>
        </CardContent>
      </Card>

      <ProfileModal open={isEditing} onOpenChange={setIsEditing} />
    </>
  );
}
