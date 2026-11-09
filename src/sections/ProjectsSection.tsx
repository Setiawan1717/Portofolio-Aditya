import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useRef } from 'react';
import FadeIn from '../components/FadeIn';
import LiveProjectButton from '../components/LiveProjectButton';

const img = (id: string) =>
  `https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_${id}.png&w=1280&q=85`;

type Project = {
  num: string;
  name: string;
  category: string;
  col1: [string, string];
  col2: string;
  href?: string;
};

const PROJECTS: Project[] = [
  {
    num: '01',
    name: 'Nextlevel Studio',
    category: 'Client',
    col1: [img('20260412_055344_5eff02e0-87a5-41ce-b64f-eb08da8f33db'), img('20260412_055431_11d841fd-8b41-46a5-82e4-b04f2407a7d8')],
    col2: img('20260412_055451_e317bf2d-28d4-48cc-86b0-6f72f25b6327'),
  },
  {
    num: '02',
    name: 'Aura Brand Identity',
    category: 'Personal',
    col1: [img('20260412_055654_911201c5-36d9-4bc6-bac7-331adfce159f'), img('20260412_055723_5ceda0b8-d9c2-4665-b2e3-83ba19ba76d1')],
    col2: img('20260412_055753_adc5dcbd-a8e6-49c0-b43a-9b030d835cea'),
  },
  {
    num: '03',
    name: 'Solaris Digital',
    category: 'Client',
    col1: [img('20260412_055759_963cfb0b-4bd1-4b0f-9d0a-09bd6cf95b2f'), img('20260412_060108_438f781a-9846-4dcc-89ab-c4e6cb830f5b')],
    col2: img('20260412_055818_9d062121-ad7e-46b9-999a-1a6a692ef1ee'),
  },
];

const RADIUS = 'rounded-[40px] sm:rounded-[50px] md:rounded-[60px]';

function ProjectCard({
  project,
  index,
  total,
  progress,
}: {
  project: Project;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const targetScale = 1 - (total - 1 - index) * 0.03;
  const scale = useTransform(progress, [index / total, 1], [1, targetScale]);

  return (
    <div className="h-[85vh] sticky top-24 md:top-32 flex items-start justify-center">
      <motion.article
        className={`relative w-full max-w-6xl border-2 border-[#D7E2EA] p-4 sm:p-6 md:p-8 origin-top ${RADIUS}`}
        style={{ background: '#0C0C0C', scale, top: `${index * 28}px` }}
      >
        {/* top row */}
        <div className="flex flex-wrap items-end justify-between gap-4 sm:gap-6 mb-4 sm:mb-6 md:mb-8 px-2 sm:px-4">
          <div className="flex items-end gap-4 sm:gap-6 md:gap-8 min-w-0">
            <span
              className="hero-heading font-black leading-none shrink-0"
              style={{ fontSize: 'clamp(3rem, 10vw, 140px)' }}
            >
              {project.num}
            </span>
            <div className="flex flex-col gap-1 pb-1 sm:pb-2 md:pb-3 min-w-0">
              <span className="text-[#D7E2EA]/60 font-light uppercase tracking-widest text-xs sm:text-sm md:text-base">
                {project.category}
              </span>
              <h3
                className="text-[#D7E2EA] font-medium uppercase leading-tight"
                style={{ fontSize: 'clamp(1rem, 2.2vw, 2.1rem)' }}
              >
                {project.name}
              </h3>
            </div>
          </div>
          <div className="pb-1 sm:pb-2 md:pb-3">
            <LiveProjectButton href={project.href} />
          </div>
        </div>

        {/* bottom row */}
        <div className="flex gap-3 sm:gap-4">
          <div className="w-[40%] flex flex-col gap-3 sm:gap-4">
            <img
              src={project.col1[0]}
              alt={`${project.name} preview 1`}
              loading="lazy"
              className={`w-full object-cover bg-[#151515] ${RADIUS}`}
              style={{ height: 'clamp(130px, 16vw, 230px)' }}
            />
            <img
              src={project.col1[1]}
              alt={`${project.name} preview 2`}
              loading="lazy"
              className={`w-full object-cover bg-[#151515] ${RADIUS}`}
              style={{ height: 'clamp(160px, 22vw, 340px)' }}
            />
          </div>
          <div className="w-[60%]">
            <img
              src={project.col2}
              alt={`${project.name} main preview`}
              loading="lazy"
              className={`w-full h-full object-cover bg-[#151515] ${RADIUS}`}
            />
          </div>
        </div>
      </motion.article>
    </div>
  );
}

export default function ProjectsSection() {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: container, offset: ['start start', 'end end'] });

  return (
    <section
      id="projects"
      className="relative z-10 -mt-10 sm:-mt-12 md:-mt-14 rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 pt-20 sm:pt-24 md:pt-32 pb-20"
      style={{ background: '#0C0C0C' }}
    >
      <FadeIn
        as="h2"
        y={40}
        className="hero-heading font-black uppercase leading-none tracking-tight text-center mb-10 sm:mb-14 md:mb-20"
        style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
      >
        Project
      </FadeIn>

      <div ref={container} className="relative">
        {PROJECTS.map((p, i) => (
          <ProjectCard key={p.num} project={p} index={i} total={PROJECTS.length} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}
