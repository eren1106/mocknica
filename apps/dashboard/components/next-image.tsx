'use client'

import { cn } from '@/lib/utils';
import Image, { ImageProps } from 'next/image'
import React from 'react'

interface NextImageProps extends ImageProps {
  src: string;
  alt: string;
  className?: string;
}

const NextImage = ({
  src,
  alt,
  className,
  ...props
}: NextImageProps) => {
  return (
    <Image
      loader={() => src}
      src={src}
      alt={alt}
      width="0"
      height="0"
      className={cn("w-auto h-auto", className)}
      {...props}
    />
  )
}

export default NextImage