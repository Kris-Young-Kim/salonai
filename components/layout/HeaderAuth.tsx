'use client';

import React from 'react';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';

export function HeaderAuth() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="h-8 w-16 animate-pulse rounded-xl bg-zinc-800" />;
  }

  if (!isSignedIn) {
    return (
      <div className="rounded-xl bg-zinc-800 hover:bg-zinc-700 px-3.5 py-1.5 text-xs font-medium text-zinc-200 transition cursor-pointer">
        <SignInButton mode="modal">
          <span>로그인</span>
        </SignInButton>
      </div>
    );
  }

  return <UserButton />;
}
