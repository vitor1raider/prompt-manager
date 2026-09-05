import { prisma } from '@/lib/prisma';
import { SidebarContent } from './sidebar-content';

export async function Sidebar() {
  const prompts = await prisma.prompt.findMany();
  return <SidebarContent prompts={prompts} />;
}
