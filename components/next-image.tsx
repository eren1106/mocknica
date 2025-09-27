'use client'

import { cn } from '@/lib/utils';
import Image from 'next/image'
import React from 'react'

interface NextImageProps {
  src: string;
  alt: string;
  className?: string;
  unoptimized?: boolean;
}

const NextImage = ({
  src,
  alt,
  className,
  unoptimized=true,
}: NextImageProps) => {
  return (
    <Image
      loader={() => src}
      src={src}
      alt={alt}
      width="0"
      height="0"
      className={cn("w-auto h-auto", className)}
      unoptimized={unoptimized}
    />
  )
}

export default NextImage