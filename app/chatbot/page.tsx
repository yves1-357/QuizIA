'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatbotModal from '@/components/ChatbotModal';

export default function ChatbotPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; id: string } | null>(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr) as { name: string; email: string; id: string };
      }
    }
    return null;
  });

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const handleClose = () => {
    router.push('/dashboard');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="chatbot-fullpage">
      <ChatbotModal
        isOpen={true}
        onClose={handleClose}
        userName={user.name}
        userId={user.id}
      />
    </div>
  );
}
