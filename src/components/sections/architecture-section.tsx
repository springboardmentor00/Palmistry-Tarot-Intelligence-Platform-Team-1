'use client';

import { motion } from 'framer-motion';
import {
  Users,
  Monitor,
  Smartphone,
  LayoutDashboard,
  Network,
  UserCog,
  IdCard,
  Hand,
  Layers,
  Brain,
  TrendingUp,
  Target,
  Bell,
  BarChart3,
  FileText,
  Shield,
  Database,
  Server,
  Cloud,
  Cpu,
  Image,
  BookOpen,
  CreditCard,
  Mail,
  LineChart,
  Activity,
  Lock,
  HardDrive,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface LayerDef {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  accent: string;
  items: {
    name: string;
    description?: string;
    icon: React.ComponentType<{ className?: string }>;
    color?: string;
  }[];
}

const CLIENT_LAYER: LayerDef = {
  id: 'clients',
  label: 'Clients / Users',
  icon: Users,
  color: 'text-violet-300',
  accent: 'from-violet-500/15 to-fuchsia-500/10',
  items: [
    { name: 'User', icon: Users },
    { name: 'Tarot Reader', icon: Users },
    { name: 'Spiritual Consultant', icon: Users },
    { name: 'Administrator', icon: Users },
  ],
};

const PRESENTATION_LAYER: LayerDef = {
  id: 'presentation',
  label: 'Presentation Layer',
  icon: Monitor,
  color: 'text-sky-300',
  accent: 'from-sky-500/15 to-cyan-500/10',
  items: [
    { name: 'Responsive Web App', icon: Monitor },
    { name: 'Mobile App', icon: Smartphone },
    { name: 'Dashboards', icon: LayoutDashboard },
    { name: 'Visualizations', icon: BarChart3 },
    { name: 'Reports', icon: FileText },
  ],
};

const GATEWAY_LAYER: LayerDef = {
  id: 'gateway',
  label: 'API Gateway (FastAPI)',
  icon: Network,
  color: 'text-fuchsia-300',
  accent: 'from-fuchsia-500/15 to-pink-500/10',
  items: [
    { name: 'Routing', icon: Network },
    { name: 'Authentication', icon: Lock },
    { name: 'Rate Limiting', icon: Activity },
    { name: 'Request Validation', icon: Shield },
    { name: 'Load Balancing', icon: Network },
    { name: 'CORS', icon: Network },
    { name: 'Logging', icon: FileText },
  ],
};

const MICROSERVICES: LayerDef = {
  id: 'microservices',
  label: 'Microservices Layer',
  icon: Server,
  color: 'text-emerald-300',
  accent: 'from-emerald-500/15 to-teal-500/10',
  items: [
    { name: 'User Service', description: 'Auth · Roles · Profiles', icon: UserCog, color: 'text-emerald-300' },
    { name: 'Profile Service', description: 'Interests · Preferences', icon: IdCard, color: 'text-sky-300' },
    { name: 'Palm Analysis', description: 'Upload · Lines · Patterns', icon: Hand, color: 'text-fuchsia-300' },
    { name: 'Tarot Reading', description: 'Deck · Spreads · Draw', icon: Layers, color: 'text-amber-300' },
    { name: 'AI Interpretation', description: 'Synthesis · Insights', icon: Brain, color: 'text-rose-300' },
    { name: 'Personality & Insights', description: 'Profiling · Life Path', icon: Brain, color: 'text-teal-300' },
    { name: 'Trend Analysis', description: 'Forecasts · Patterns', icon: TrendingUp, color: 'text-amber-300' },
    { name: 'Recommendation', description: 'Guidance · Alignment', icon: Target, color: 'text-pink-300' },
    { name: 'Notification', description: 'Reminders · Alerts', icon: Bell, color: 'text-teal-300' },
    { name: 'Analytics', description: 'Engagement · KPIs', icon: BarChart3, color: 'text-sky-300' },
    { name: 'Report Service', description: 'PDF · Excel · Custom', icon: FileText, color: 'text-fuchsia-300' },
    { name: 'Admin Service', description: 'Monitor · Audit · Config', icon: Shield, color: 'text-amber-300' },
  ],
};

const AI_ENGINE: LayerDef = {
  id: 'ai-engine',
  label: 'AI / ML & Intelligence Engine',
  icon: Cpu,
  color: 'text-rose-300',
  accent: 'from-rose-500/15 to-orange-500/10',
  items: [
    { name: 'Palm Line Detection (CNN)', icon: Hand },
    { name: 'Palm Feature Recognition', icon: Image },
    { name: 'Tarot Card Recognition', icon: Layers },
    { name: 'NLP Interpretation (LLM)', icon: Brain },
    { name: 'Insight Generation Engine', icon: Sparkles },
    { name: 'Recommendation Engine', icon: Target },
    { name: 'Personality Profiling', icon: Brain },
    { name: 'Trend Prediction Model', icon: TrendingUp },
  ],
};

const DATA_LAYER: LayerDef = {
  id: 'data',
  label: 'Data Layer',
  icon: Database,
  color: 'text-amber-300',
  accent: 'from-amber-500/15 to-yellow-500/10',
  items: [
    { name: 'PostgreSQL', description: 'Users · Readings · Reports', icon: Database, color: 'text-sky-300' },
    { name: 'MongoDB', description: 'Palm features · Insights', icon: Database, color: 'text-emerald-300' },
    { name: 'Redis Cache', description: 'Sessions · Quick lookup', icon: HardDrive, color: 'text-rose-300' },
    { name: 'Elasticsearch', description: 'Full-text · Insight search', icon: Server, color: 'text-amber-300' },
    { name: 'Vector DB (FAISS)', description: 'Embeddings · Semantic', icon: Cpu, color: 'text-violet-300' },
    { name: 'Media Storage', description: 'Palm images · Reports', icon: HardDrive, color: 'text-teal-300' },
    { name: 'Knowledge Graph (Neo4j)', description: 'Symbols · Card meanings', icon: Network, color: 'text-fuchsia-300' },
    { name: 'Time Series (InfluxDB)', description: 'Trends · Engagement', icon: LineChart, color: 'text-orange-300' },
  ],
};

const EXTERNAL_SERVICES: LayerDef = {
  id: 'external',
  label: 'External Services & Data Sources',
  icon: Cloud,
  color: 'text-cyan-300',
  accent: 'from-cyan-500/15 to-blue-500/10',
  items: [
    { name: 'Cloud Storage (S3 / Azure)', icon: Cloud },
    { name: 'AI / NLP APIs (OpenAI · LangChain)', icon: Brain },
    { name: 'Image Processing (OpenCV · Rekognition)', icon: Image },
    { name: 'Spiritual & Tarot Knowledge Base', icon: BookOpen },
    { name: 'Payment Gateway (Stripe · Razorpay)', icon: CreditCard },
    { name: 'Email / SMS (SendGrid · Twilio)', icon: Mail },
    { name: 'Analytics (Google Analytics)', icon: BarChart3 },
  ],
};

const INFRASTRUCTURE = [
  {
    title: 'Monitoring & Logging',
    icon: Activity,
    items: [
      'Application Monitoring',
      'Error Tracking',
      'Performance Monitoring',
      'Log Management',
      'Alert Management',
    ],
  },
  {
    title: 'Backup & Security',
    icon: Lock,
    items: [
      'Automated Backups',
      'Data Encryption',
      'Security Monitoring',
      'Access Control',
      'Disaster Recovery',
    ],
  },
];

function Sparkles({ className }: { className?: string }) {
  return <span className={className}>✦</span>;
}

export function ArchitectureSection() {
  return (
    <div className="space-y-8">
      <header className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60 mb-3">
          <Network className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            System Architecture
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
          Platform Architecture
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Mystica is a layered microservices platform. The diagram below
          mirrors the original architecture blueprint, from clients through
          gateway, services, AI engine, and the multi-database data layer.
        </p>
      </header>

      {/* Layered diagram */}
      <div className="space-y-4">
        <LayerCard layer={CLIENT_LAYER} layout="grid" />
        <Connector label="HTTPS · JSON REST API" />
        <LayerCard layer={PRESENTATION_LAYER} layout="grid" />
        <Connector label="Internal routing" />
        <LayerCard layer={GATEWAY_LAYER} layout="grid" />
        <Connector label="Service mesh" />
        <LayerCard layer={MICROSERVICES} layout="grid" />
        <Connector label="Model invocation" />
        <LayerCard layer={AI_ENGINE} layout="grid" />
        <Connector label="Persistence" />
        <LayerCard layer={DATA_LAYER} layout="grid" />
      </div>

      {/* External services sidebar */}
      <LayerCard layer={EXTERNAL_SERVICES} layout="grid" />

      {/* Infrastructure */}
      <div className="grid md:grid-cols-2 gap-4">
        {INFRASTRUCTURE.map((g) => {
          const Icon = g.icon;
          return (
            <Card key={g.title} className="bg-card/60 backdrop-blur border-border/50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-lg bg-secondary/60 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-display text-base font-semibold">
                  {g.title}
                </h3>
              </div>
              <ul className="space-y-1.5">
                {g.items.map((it) => (
                  <li
                    key={it}
                    className="text-sm text-muted-foreground flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-primary/60" />
                    {it}
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <Card className="bg-card/40 border-border/50 p-5">
        <h3 className="font-display text-base font-semibold mb-3">
          Connection Legend
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <LegendItem label="Synchronous (HTTP/HTTPS)" line="solid" />
          <LegendItem label="Asynchronous (Message Queue)" line="dashed" />
          <LegendItem label="Data Flow" line="thin" />
          <LegendItem label="External Integration" line="dotted" />
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Microservices" value="12" />
        <StatCard label="AI/ML Models" value="8" />
        <StatCard label="Database Types" value="8" />
        <StatCard label="External Integrations" value="7" />
      </div>
    </div>
  );
}

function LayerCard({
  layer,
  layout,
}: {
  layer: LayerDef;
  layout: 'grid' | 'row';
}) {
  const Icon = layer.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        className={cn(
          'relative overflow-hidden bg-card/50 backdrop-blur border-border/50 p-5'
        )}
      >
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-50 pointer-events-none',
            layer.accent
          )}
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg bg-background/60 border border-border/50 flex items-center justify-center">
              <Icon className={cn('w-4 h-4', layer.color)} />
            </div>
            <h2 className="font-display text-lg font-semibold">{layer.label}</h2>
          </div>
          <div
            className={cn(
              'grid gap-2',
              layout === 'grid' &&
                'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
            )}
          >
            {layer.items.map((it) => {
              const ItemIcon = it.icon;
              return (
                <div
                  key={it.name}
                  className="p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/40 transition-all group"
                >
                  <ItemIcon
                    className={cn(
                      'w-4 h-4 mb-2',
                      it.color ?? layer.color
                    )}
                  />
                  <div className="text-xs font-medium leading-tight">
                    {it.name}
                  </div>
                  {it.description && (
                    <div className="text-[10px] text-muted-foreground mt-1 leading-snug">
                      {it.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function Connector({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-1">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-primary/60" />
      <span className="text-[10px] uppercase tracking-wider text-primary/80 font-medium px-2">
        {label}
      </span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-primary/40 to-primary/60" />
    </div>
  );
}

function LegendItem({ label, line }: { label: string; line: string }) {
  return (
    <div className="flex items-center gap-2">
      <svg width="40" height="8" className="shrink-0">
        <line
          x1="0"
          y1="4"
          x2="40"
          y2="4"
          stroke="oklch(0.72 0.18 75 / 0.8)"
          strokeWidth={line === 'thin' ? 1 : 2}
          strokeDasharray={
            line === 'dashed'
              ? '6 4'
              : line === 'dotted'
                ? '2 3'
                : line === 'thin'
                  ? '0'
                  : '0'
          }
        />
      </svg>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="bg-card/60 backdrop-blur border-border/50 p-4 text-center">
      <div className="font-display text-2xl font-bold text-primary">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </Card>
  );
}
