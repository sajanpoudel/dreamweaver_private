import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NewDreamForm } from '@/components/dreams/NewDreamForm';

export default async function NewDreamPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/api/auth/signin');
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl space-y-8">
      <h1 className="text-3xl font-bold">Record New Dream</h1>
      <NewDreamForm />
    </div>
  );
} 