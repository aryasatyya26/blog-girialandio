import { FormEvent, MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

const cinematicEase = [0.22, 1, 0.36, 1] as const;
const ringtoneTailSeconds = 8;

// IMAGE SETTINGS: edit the portrait file, crop, and color treatment here.
const imageSettings = {
  portrait: {
    src: '/Giri1.jpg',
    alt: 'Portrait of a man in a black suit and dark sunglasses',
    hero: {
      fit: 'cover',
      position: '50% 30%',
      mobilePosition: '50% 15%',
      filter: 'contrast(1.12) saturate(.72)',
    },
    about: {
      fit: 'cover',
      position: '50% 50%',
      mobilePosition: '50% 50%',
      filter: 'grayscale(.45) contrast(1.2)',
    },
  },
} as const;

type IconName = 'arrow' | 'close' | 'menu' | 'seal';
const Icon = ({ name, size = 18 }: { name: IconName; size?: number }) => {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <><path d="M4 12h15M14 7l5 5-5 5" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    menu: <><path d="M4 8h16M4 16h16" /></>,
    seal: <><circle cx="12" cy="9" r="5" /><path d="m9 14-1 7 4-2 4 2-1-7" /></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
};

function EmberField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context || prefersReducedMotion) return;

    type Ember = { x: number; y: number; radius: number; speed: number; drift: number; phase: number; opacity: number };
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let frame = 0;
    let lastTime = 0;
    const embers: Ember[] = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      if (embers.length === 0) {
        for (let index = 0; index < 58; index += 1) {
          embers.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: 0.8 + Math.random() * 1.8,
            speed: 0.25 + Math.random() * 0.65,
            drift: (Math.random() - 0.5) * 0.32,
            phase: Math.random() * Math.PI * 2,
            opacity: 0.38 + Math.random() * 0.48,
          });
        }
      }
    };

    const animate = (time: number) => {
      if (document.hidden) {
        frame = 0;
        return;
      }
      const delta = lastTime ? Math.min((time - lastTime) / 16.67, 2) : 1;
      lastTime = time;
      context.clearRect(0, 0, width, height);
      embers.forEach((ember) => {
        ember.y -= ember.speed * delta;
        ember.x += ember.drift * delta;
        if (ember.y < -8) {
          ember.y = height + 8;
          ember.x = Math.random() * width;
        }
        const flicker = ember.opacity * (0.65 + Math.sin(time * 0.002 + ember.phase) * 0.35);
        context.fillStyle = ember.phase > Math.PI ? '#fbbf24' : '#f97316';
        context.globalAlpha = flicker * 0.24;
        context.beginPath();
        context.arc(ember.x, ember.y, ember.radius * 3.2, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = flicker;
        context.beginPath();
        context.arc(ember.x, ember.y, ember.radius, 0, Math.PI * 2);
        context.fill();
      });
      context.globalAlpha = 1;
      frame = window.requestAnimationFrame(animate);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
      } else if (!frame) {
        lastTime = 0;
        frame = window.requestAnimationFrame(animate);
      }
    };

    resize();
    frame = window.requestAnimationFrame(animate);
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [prefersReducedMotion]);

  return <canvas className="ember-canvas" ref={canvasRef} aria-hidden="true" />;
}

const skills = [
  ['Professional Work Ethic', 96, 'Committed to excellence, reliability, and high-standard execution.'],
  ['Team Collaboration', 94, 'Thriving in cross-functional teams to achieve shared success.'],
  ['Goal-Oriented', 95, 'Driven by clear targets, measurable milestones, and real results.'],
  ['Effective Communication', 92, 'Translating complex ideas into clear, actionable alignment.'],
  ['Leadership', 90, 'Guiding teams with vision, accountability, and decisive direction.'],
] as const;

const projects = [
  { id: '001', title: 'Nero Private Bank', category: 'FINTECH · PRODUCT DESIGN', tools: 'FIGMA / PROTOPIE / REACT', metric: '+47% activation', visual: 'bank', description: 'A private wealth platform rebuilt around discretion, confidence, and decisive intelligence.', detail: 'We transformed a fragmented twelve-step onboarding process into one measured, progressive journey. The new system pairs private-market data with human language, giving members confidence without sacrificing sophistication.' },
  { id: '002', title: 'Casa Ombra', category: 'HOSPITALITY · BRAND SYSTEM', tools: 'STRATEGY / IDENTITY / DIGITAL', metric: '2.3× bookings', visual: 'hotel', description: 'A members-only hospitality identity shaped by ritual, provenance, and unforgettable nights.', detail: 'From positioning and visual identity to the booking experience, Casa Ombra was designed as a digital speakeasy. Every interaction reveals just enough, turning discovery into desire.' },
  { id: '003', title: 'Redline Intelligence', category: 'B2B · DATA EXPERIENCE', tools: 'RESEARCH / UX / DESIGN SYSTEM', metric: '−38% task time', visual: 'intel', description: 'A command center that turns operational noise into an immediate, actionable point of view.', detail: 'Field research with risk analysts exposed a costly pattern of context switching. A modular intelligence layer unified alerts, entities, and investigation trails in one disciplined workspace.' },
] as const;

const history = [
  ['2022 — NOW', 'Independent Creative Director', 'Moretti Studio · New York', 'Leading product strategy, identity, and digital execution for ambitious teams in finance, culture, and technology.'],
  ['2019 — 2022', 'Design Director', 'North & Co. · London', 'Built an award-winning digital practice and directed global launches across four continents.'],
  ['2016 — 2019', 'Senior Product Designer', 'Obsidian Labs · Milan', 'Designed enterprise platforms and established the company’s first cross-product design system.'],
  ['2012 — 2016', 'BFA, Communication Design', 'Parsons School of Design', 'Graduated with honors. D&AD New Blood winner and AIGA portfolio distinction.'],
] as const;

function Portrait({ className = '', placement = 'hero' }: { className?: string; placement?: 'hero' | 'about' }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className={`portrait-fallback ${className}`} role="img" aria-label="Portrait placeholder"><span>G.A</span></div>;
  const settings = imageSettings.portrait[placement];
  const style = {
    '--portrait-fit': settings.fit,
    '--portrait-position': settings.position,
    '--portrait-mobile-position': settings.mobilePosition,
    '--portrait-filter': settings.filter,
  } as React.CSSProperties;
  return <img className={className} src={imageSettings.portrait.src} alt={imageSettings.portrait.alt} style={style} onError={() => setFailed(true)} />;
}

function Intro({ onFinish, onStartMusic }: { onFinish: () => void; onStartMusic: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const leave = () => {
    onStartMusic();
    setLeaving(true);
    window.setTimeout(onFinish, 850);
  };
  return (
    <div className={`intro ${leaving ? 'intro-leaving' : ''}`} role="dialog" aria-modal="true" aria-label="Cinematic introduction">
      <div className="projector" aria-hidden="true" /><div className="intro-smoke" aria-hidden="true" />
      <button className="skip-intro" onClick={leave}>SKIP INTRO</button>
      <div className="intro-center">
        <div className="intro-mark"><span>V</span><i>M</i></div>
        <p className="intro-line line-one">WELCOME TO MY WORLD.</p>
        <p className="intro-line line-two">GIRI ALANDIO AREA.</p>
        <button className="enter-button magnetic" onClick={leave}><span>ENTER</span><small>PRIVATE INVITATION · Nº 071</small></button>
      </div>
    </div>
  );
}

function ProjectCard({ project, onOpen, reducedMotion }: { project: typeof projects[number]; onOpen: () => void; reducedMotion: boolean | null }) {
  const ref = useRef<HTMLElement>(null);
  const move = (event: ReactMouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    event.currentTarget.style.setProperty('--rx', `${(0.5 - y) * 7}deg`);
    event.currentTarget.style.setProperty('--ry', `${(x - 0.5) * 7}deg`);
    event.currentTarget.style.setProperty('--mx', `${x * 100}%`);
  };
  const reset = () => { ref.current?.style.setProperty('--rx', '0deg'); ref.current?.style.setProperty('--ry', '0deg'); };
  return (
    <article ref={ref} className="operation reveal" onMouseMove={move} onMouseLeave={reset}>
      <motion.button
        onClick={onOpen}
        aria-label={`View case file: ${project.title}`}
        whileHover={reducedMotion ? undefined : { y: -4, transition: { duration: 0.35, ease: cinematicEase } }}
        whileTap={reducedMotion ? undefined : { scale: 0.995 }}
      >
        <div className={`operation-visual ${project.visual}`}>
          <div className="scan" /><span className="crosshair">+</span>
          <div className="mock-window"><i /><i /><i /><b>{project.id}</b></div>
        </div>
        <div className="operation-copy">
          <div className="file-meta"><span>OPERATION / {project.id}</span><span>CLASSIFIED</span></div>
          <h3>{project.title}</h3><p>{project.description}</p>
          <div className="file-foot"><span>{project.category}</span><span className="view-case">VIEW CASE FILE <Icon name="arrow" /></span></div>
        </div>
      </motion.button>
    </article>
  );
}

function ProjectModal({ project, onClose }: { project: typeof projects[number]; onClose: () => void }) {
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    dialog.current?.focus();
    const keys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !dialog.current) return;
      const items = [...dialog.current.querySelectorAll<HTMLElement>('button,[href],[tabindex]:not([tabindex="-1"])')];
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keys);
    return () => { document.removeEventListener('keydown', keys); previous?.focus(); };
  }, [onClose]);
  return <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className="case-modal" ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button className="modal-close" onClick={onClose} aria-label="Close case file"><Icon name="close" size={24} /></button>
      <span className="modal-index">CASE FILE / {project.id}</span>
      <div className={`modal-visual ${project.visual}`}><span>CONFIDENTIAL</span><b>{project.metric}</b></div>
      <div className="modal-content"><p>{project.category}</p><h2 id="modal-title">{project.title}</h2><div className="modal-divider" />
        <div className="modal-columns"><div><small>THE BRIEF</small><p>{project.detail}</p></div><div><small>TOOLS OF THE TRADE</small><p>{project.tools}</p><small>THE RESULT</small><strong>{project.metric}</strong></div></div>
      </div>
    </div>
  </div>;
}

export default function App() {
  const [intro, setIntro] = useState(true);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeProject, setActiveProject] = useState<typeof projects[number] | null>(null);
  const [sent, setSent] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(150);
  const [soundEffects, setSoundEffects] = useState(true);
  const [audioSettingsOpen, setAudioSettingsOpen] = useState(false);
  const [audioMessage, setAudioMessage] = useState('');
  const cursor = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const portraitY = useTransform(scrollYProgress, [0, 1], [0, 24]);

  const getAudioContext = () => {
    const audio = audioRef.current;
    if (!audio) throw new Error('Elemen audio belum siap.');
    if (!audioContextRef.current) {
      if (!window.AudioContext) throw new Error('Browser ini tidak mendukung Web Audio.');
      audioContextRef.current = new AudioContext();
    }
    const context = audioContextRef.current;
    if (!musicGainRef.current) {
      const source = context.createMediaElementSource(audio);
      const gain = context.createGain();
      const compressor = context.createDynamicsCompressor();
      gain.gain.value = volume / 100;
      compressor.threshold.value = -6;
      compressor.knee.value = 3;
      compressor.ratio.value = 12;
      source.connect(gain);
      gain.connect(compressor);
      compressor.connect(context.destination);
      musicGainRef.current = gain;
    }
    return context;
  };

  const startMusic = async () => {
    try {
      const context = getAudioContext();
      if (context.state === 'suspended') await context.resume();
      await audioRef.current?.play();
      setAudioMessage('');
    } catch (error) {
      setAudioMessage(error instanceof Error ? `Audio tidak dapat diputar: ${error.message}` : 'Audio tidak dapat diputar.');
    }
  };

  const playInterfaceSound = async () => {
    if (!soundEffects) return;
    try {
      const context = getAudioContext();
      if (context.state === 'suspended') await context.resume();
      const clickGain = context.createGain();
      const oscillator = context.createOscillator();
      const now = context.currentTime;
      clickGain.gain.setValueAtTime(0.055, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(620, now);
      oscillator.frequency.exponentialRampToValueAtTime(190, now + 0.055);
      oscillator.connect(clickGain);
      clickGain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.07);
    } catch (error) {
      setAudioMessage(error instanceof Error ? `Efek tombol tidak tersedia: ${error.message}` : 'Efek tombol tidak tersedia.');
    }
  };

  const handleInterfaceClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    const target = event.target;
    if (target instanceof Element && target.closest('button, a, [role="button"]')) {
      void playInterfaceSound();
    }
  };

  useEffect(() => {
    document.body.style.overflow = intro ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [intro]);
  useEffect(() => {
    if (musicGainRef.current && audioContextRef.current) {
      musicGainRef.current.gain.setTargetAtTime(volume / 100, audioContextRef.current.currentTime, 0.04);
    }
  }, [volume]);
  useEffect(() => () => {
    if (audioContextRef.current) void audioContextRef.current.close();
  }, []);
  useEffect(() => {
    const reveal = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')), { threshold: .1 });
    document.querySelectorAll('.reveal').forEach((item) => reveal.observe(item));
    const move = (event: MouseEvent) => { if (cursor.current) cursor.current.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`; };
    const scroll = () => setScrolled(scrollY > 60);
    addEventListener('mousemove', move); addEventListener('scroll', scroll, { passive: true });
    return () => { reveal.disconnect(); removeEventListener('mousemove', move); removeEventListener('scroll', scroll); };
  }, []);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const saved = JSON.parse(localStorage.getItem('private-connections') || '[]');
      saved.push({ ...data, createdAt: new Date().toISOString() });
      localStorage.setItem('private-connections', JSON.stringify(saved));
    } catch { /* Confirmation is still valid for this local session. */ }
    event.currentTarget.reset(); setSent(true);
  };
  const links = ['Home', 'About', 'Skills', 'Projects', 'Experience', 'Contact'];

  return <div className="site" onClick={handleInterfaceClick}>
    <EmberField />
    <div className="vignette" aria-hidden="true" />
    {intro && <Intro onFinish={() => setIntro(false)} onStartMusic={() => { void startMusic(); }} />}
    <div className="cursor" ref={cursor} aria-hidden="true"><span /></div>
    <div className="grain" aria-hidden="true" /><a className="skip-link" href="#main">Skip to content</a>
    <header className={`topbar ${scrolled ? 'compact' : ''}`}>
      <nav aria-label="Primary navigation">
        <a className="brand" href="#home" aria-label="Vincent Moretti home"><span>V</span><i>M</i></a>
        <button className="menu-button" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label="Toggle navigation"><Icon name={menu ? 'close' : 'menu'} size={23} /></button>
        <div className={`nav-list ${menu ? 'open' : ''}`}>{links.map((link, index) => <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setMenu(false)}><b>0{index + 1}</b>{link}</a>)}</div>
      </nav>
    </header>

    <main id="main">
      <section className="hero" id="home" ref={heroRef}>
        <div className="hero-glow" /><div className="smoke s1" /><div className="smoke s2" />
        <motion.div
          className="hero-portrait"
          style={prefersReducedMotion ? undefined : { y: portraitY }}
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.98 }}
          animate={intro ? { opacity: 0, scale: 0.98 } : { opacity: 1, scale: 1 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 1.1, ease: cinematicEase }}
        >
          <Portrait /><div className="portrait-shade" /><span className="portrait-code">SUBJECT Nº 071<br />IDENTITY VERIFIED</span>
        </motion.div>
        <motion.div
          className="hero-copy"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={intro ? { opacity: 0, y: prefersReducedMotion ? 0 : 20 } : { opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.9, ease: cinematicEase }}
        >
          <p className="kicker reveal">VINCENT MORETTI · CREATIVE DIRECTOR</p>
          <h1 className="reveal">A NAME<br />GIRI<em>ALANDIO</em><br />.</h1>
          <p className="hero-sub reveal">Berjuang sampai titik darah penghabisan demi menjunjung tinggi harga diri dan martabat orang tua, menjadikan setiap tempaan serta pembelajaran hidup sebagai pijakan mutlak untuk menegakkan jati diri.</p>
          <div className="hero-actions reveal"><a className="red-button magnetic" href="#about">Explore my world <Icon name="arrow" /></a><a className="outline-button magnetic" href="#projects">View my work</a></div>
        </motion.div>
        <div className="hero-side" aria-hidden="true"><span>01</span><i /><small>06</small></div>
        <a href="#about" className="scroll-cue"><i /><span>SCROLL TO ENTER</span></a>
      </section>

      <div className="marquee" aria-hidden="true"><div>STRATEGY <i /> IDENTITY <i /> EXPERIENCE <i /> EXECUTION <i /> STRATEGY <i /> IDENTITY <i /> EXPERIENCE <i /> EXECUTION <i /></div></div>

      <section className="about section" id="about">
        <div className="section-tag reveal"><span>01</span> THE MAN BEHIND THE LEGEND</div>
        <div className="about-layout">
          <div className="about-image reveal"><Portrait placement="about" /><span className="image-frame" /><p>KARAWANG / INDONESIA<br />EST. 2025</p></div>
          <div className="about-story">
            <p className="red-label reveal">THE MAN BEHIND THE SHADOW</p>
            <h2 className="reveal">I build what others<br />only <em>imagine.</em></h2>
            <p className="lead reveal">I’m a multidisciplinary creative director shaping digital products, brands, and experiences for those who refuse to be ordinary.</p>
            <p className="body-copy reveal">My work lives where strategy meets seduction—where exacting systems become unforgettable moments. For over a decade, I’ve helped leaders turn uncertainty into identity, utility into desire, and ambition into an enduring advantage.</p>
            <div className="about-facts reveal"><span><b>12+</b>YEARS OF CRAFT</span><span><b>48</b>OPERATIONS</span><span><b>09</b>GLOBAL AWARDS</span></div>
          </div>
        </div>
        <blockquote className="reveal"><span>“</span>POWER IS NOT GIVEN. IT IS BUILT THROUGH<br />VISION, DISCIPLINE, AND EXECUTION.</blockquote>
      </section>

      <section className="skills section" id="skills">
        <div className="section-tag reveal"><span>02</span> INTELLIGENCE INVENTORY</div>
        <div className="heading-row reveal"><div><p className="red-label">THE ARSENAL</p><h2>Every weapon.<br /><em>Mastered.</em></h2></div><p>Five strengths. One point of view. A complete creative operation engineered to take ideas from first signal to final impact.</p></div>
        <div className="skill-dashboard">{skills.map(([name, value, desc], index) => <article className="skill-card reveal" key={name}>
          <div className="skill-top"><span>0{index + 1}</span><b>{value}%</b></div><h3>{name}</h3><p>{desc}</p><div className="skill-track" aria-label={`${name}: ${value}% proficiency`}><i style={{ '--skill': `${value}%` } as React.CSSProperties} /></div>
        </article>)}</div>
      </section>

      <section className="projects section" id="projects">
        <div className="section-tag reveal"><span>03</span> CLASSIFIED CASE ARCHIVE</div>
        <div className="heading-row reveal"><div><p className="red-label">THE OPERATIONS</p><h2>Work that leaves<br />a <em>mark.</em></h2></div><p>Selected missions where strategy, craft, and measured audacity changed the outcome.</p></div>
        <div className="operations">{projects.map((project) => <ProjectCard key={project.id} project={project} onOpen={() => setActiveProject(project)} reducedMotion={prefersReducedMotion} />)}</div>
      </section>

      <section className="experience section" id="experience">
        <div className="section-tag reveal"><span>04</span> ARCHIVED HISTORY</div>
        <div className="experience-head reveal"><p className="red-label">THE HISTORY</p><h2>Every empire<br />has a <em>history.</em></h2></div>
        <div className="timeline">{history.map(([year, role, place, copy], index) => <article className="timeline-row reveal" key={year}>
          <div className="timeline-date">{year}</div><div className="timeline-node"><span>{index + 1}</span></div>
          <div className="timeline-title"><h3>{role}</h3><p>{place}</p></div><p className="timeline-copy">{copy}</p>
        </article>)}</div>
      </section>

      <section className="contact section" id="contact">
        <div className="contact-panel reveal">
          <div className="contact-intro"><div className="section-tag"><span>05</span> PRIVATE CHANNEL</div><p className="red-label">THE PRIVATE CONNECTION</p><h2>Everything starts<br />with a <em>connection.</em></h2><p>Have a project in mind? Let’s make something unforgettable.</p>
            <div className="socials"><a href="mailto:hello@vincentmoretti.design">EMAIL ↗</a><a href="#contact">INSTAGRAM ↗</a><a href="#contact">LINKEDIN ↗</a><a href="#contact">WHATSAPP ↗</a></div>
          </div>
          {sent ? <div className="signal" role="status"><div className="signal-ring"><span /></div><small>TRANSMISSION RECEIVED</small><h3>The message is secured.</h3><p>Saved in this browser for the portfolio preview. Connect a service before publishing to receive live messages.</p><button className="red-button" onClick={() => setSent(false)}>New transmission</button></div> :
          <form onSubmit={submit}>
            <div className="form-row"><label>YOUR NAME<input name="name" autoComplete="name" required placeholder="Enter your name" /></label><label>YOUR EMAIL<input name="email" autoComplete="email" type="email" required placeholder="Enter your email" /></label></div>
            <label>PROJECT TYPE<select name="type" required defaultValue=""><option value="" disabled>Select an operation</option><option>Product Design</option><option>Brand Identity</option><option>Creative Direction</option><option>Digital Strategy</option></select></label>
            <label>YOUR MESSAGE<textarea name="message" required rows={5} placeholder="Tell me what we're building..." /></label>
            <button className="red-button submit magnetic" type="submit">Send the message <Icon name="arrow" /></button>
          </form>}
        </div>
      </section>
    </main>
    <footer><a className="brand" href="#home"><span>V</span><i>M</i></a><p>BUILT IN SILENCE. <b>REMEMBERED FOREVER.</b></p><span>© 2025 VINCENT MORETTI</span><a href="#home">BACK TO TOP ↑</a></footer>
    {activeProject && <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />}
    <aside className={`audio-dock ${audioSettingsOpen ? 'expanded' : ''}`} aria-label="Music and sound settings">
      <div className="audio-heading">
        <span className={`audio-indicator ${playing ? 'playing' : ''}`} aria-hidden="true" />
        <span>GANGSTA · SOUNDTRACK</span>
        <button className="audio-play" onClick={() => playing ? audioRef.current?.pause() : void startMusic()} aria-label={playing ? 'Pause soundtrack' : 'Play soundtrack'}>
          {playing ? 'PAUSE' : 'PLAY'}
        </button>
        <button
          className="audio-settings-toggle"
          onClick={() => setAudioSettingsOpen((open) => !open)}
          aria-expanded={audioSettingsOpen}
          aria-controls="audio-settings"
          aria-label={audioSettingsOpen ? 'Hide audio settings' : 'Show audio settings'}
        >
          {audioSettingsOpen ? 'LESS' : 'MORE'}
        </button>
      </div>
      <div className="audio-settings" id="audio-settings">
        <label className="volume-control">
          <span>GAIN</span>
          <input aria-label="Music volume" type="range" min="0" max="150" step="5" value={volume} onChange={(event) => setVolume(Number(event.currentTarget.value))} />
          <output>{volume}%</output>
        </label>
        <div className="audio-footer">
          <button className="sound-toggle" onClick={() => setSoundEffects((enabled) => !enabled)} aria-pressed={soundEffects}>
            BUTTON SFX {soundEffects ? 'ON' : 'OFF'}
          </button>
          <span role={audioMessage ? 'alert' : 'status'}>{audioMessage || (playing ? 'NOW PLAYING' : 'READY WHEN YOU ARE')}</span>
        </div>
      </div>
      <audio
        ref={audioRef}
        src="/Gangsta.mp3"
        loop
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => {
          const audio = event.currentTarget;
          if (Number.isFinite(audio.duration) && audio.duration > ringtoneTailSeconds && audio.currentTime >= audio.duration - ringtoneTailSeconds) {
            audio.currentTime = 0;
          }
        }}
        onError={() => setAudioMessage('File Gangsta.mp3 tidak dapat dimuat dari folder public.')}
      />
    </aside>
  </div>;
}
