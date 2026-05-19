import { notFound } from 'next/navigation';
import Image from 'next/image';
import { projects } from '@/data/projects';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import Link from 'next/link';

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.id }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const project = projects.find((p) => p.id === resolvedParams.slug);

  if (!project) {
    notFound();
  }

  return (
    <main style={{ backgroundColor: '#EDEADF', minHeight: '100vh', color: '#2C1810' }}>
      {/* Navigation */}
      <nav style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 50, padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" className="text-label" style={{ color: '#B8860B' }}>
          ← BACK TO HOME
        </Link>
      </nav>

      {/* Hero Section */}
      <section style={{ position: 'relative', width: '100%', height: '80vh', overflow: 'hidden' }}>
        {project.heroImage && (
          <Image
            src={project.heroImage}
            alt={project.name}
            fill
            style={{ objectFit: 'cover' }}
            priority={true}
          />
        )}
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: 'clamp(2rem, 5vw, 5rem)', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div className="container">
            <h1 className="text-hero" style={{ color: '#EDEADF', marginBottom: '1rem' }}>{project.name}</h1>
            <p className="text-body" style={{ color: 'rgba(237,234,223,0.8)', maxWidth: '600px' }}>{project.excerpt}</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section" style={{ borderBottom: '1px solid var(--color-glass-border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            <div>
              <div className="text-label" style={{ marginBottom: '0.5rem', color: 'var(--color-muted-brown)' }}>LOCATION</div>
              <div className="text-body" style={{ fontWeight: 500 }}>{project.area}, {project.city}</div>
            </div>
            <div>
              <div className="text-label" style={{ marginBottom: '0.5rem', color: 'var(--color-muted-brown)' }}>CATEGORY</div>
              <div className="text-body" style={{ fontWeight: 500, textTransform: 'capitalize' }}>{project.category}</div>
            </div>
            <div>
              <div className="text-label" style={{ marginBottom: '0.5rem', color: 'var(--color-muted-brown)' }}>YEAR</div>
              <div className="text-body" style={{ fontWeight: 500 }}>{project.year}</div>
            </div>
            <div>
              <div className="text-label" style={{ marginBottom: '0.5rem', color: 'var(--color-muted-brown)' }}>AREA</div>
              <div className="text-body" style={{ fontWeight: 500 }}>{project.sqft} SQFT</div>
            </div>
          </div>
        </div>
      </section>

      {/* Before & After Section */}
      {(project.beforeImage && project.afterImage) && (
        <section className="section" style={{ backgroundColor: '#E5E2D7' }}>
          <div className="container">
            <h2 className="text-title" style={{ marginBottom: '2.5rem', textAlign: 'center' }}>Transformation</h2>
            <BeforeAfterSlider 
              beforeImage={project.beforeImage} 
              afterImage={project.afterImage}
              materials={project.materials}
            />
          </div>
        </section>
      )}

      {/* Materials Section */}
      {project.materials && project.materials.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="text-title" style={{ marginBottom: '2.5rem' }}>Curated Materials</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {project.materials.map((mat, idx) => (
                <div key={idx} style={{ position: 'relative', overflow: 'hidden', borderRadius: '4px', aspectRatio: '1/1' }}>
                  <Image 
                    src={mat.image} 
                    alt={mat.name} 
                    fill 
                    style={{ objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.2)' }} />
                  <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem', color: '#EDEADF' }}>
                    <div className="text-label" style={{ marginBottom: '0.25rem', opacity: 0.9 }}>{mat.type}</div>
                    <div className="text-body-sm" style={{ fontWeight: 500 }}>{mat.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Process / Behind the Build Section */}
      {project.processImages && project.processImages.length > 0 && (
        <section className="section" style={{ backgroundColor: '#E5E2D7' }}>
          <div className="container">
            <h2 className="text-title" style={{ marginBottom: '2.5rem' }}>Behind The Build</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {project.processImages.map((img, idx) => (
                <div key={idx} style={{ position: 'relative', height: '50vh', borderRadius: '4px', overflow: 'hidden' }}>
                  <Image 
                    src={img} 
                    alt={`Process ${idx + 1}`} 
                    fill 
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer minimal */}
      <footer style={{ padding: '4rem 0', borderTop: '1px solid var(--color-glass-border)', textAlign: 'center' }}>
        <Link href="/#projects" className="btn btn--primary">
          Return to All Projects
        </Link>
      </footer>
    </main>
  );
}
