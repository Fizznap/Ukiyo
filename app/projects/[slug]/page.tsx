import { notFound } from 'next/navigation'
import { projects } from '@/data/projects'
import ProjectPageClient from '@/components/ProjectPageClient'

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.id }))
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const project = projects.find((p) => p.id === resolvedParams.slug)

  if (!project) {
    notFound()
  }

  return <ProjectPageClient project={project} />
}
