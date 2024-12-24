import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function NewDreamButton() {
  return (
    <Link href="/dreams/new">
      <Button className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        New Dream
      </Button>
    </Link>
  );
} 