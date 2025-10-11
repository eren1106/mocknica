import React from 'react'
import Link from 'next/link'
import { Button, ButtonProps } from './ui/button';

interface LinkButtonProps extends ButtonProps {
  href: string;
  openNewTab?: boolean;
}

const LinkButton = ({
  children,
  href,
  openNewTab = false,
  ...props
}: LinkButtonProps) => {
  return (
    <Button asChild {...props}>
      <Link href={href} target={openNewTab ? '_blank' : ''}>{children}</Link>
    </Button>
  )
}

export default LinkButton