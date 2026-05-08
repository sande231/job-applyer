import express from 'express';
import { savedJobsDb } from '../db/sqlite.js';

const router = express.Router();

function portalUrl(job) {
  const t = encodeURIComponent(job.title);
  const c = encodeURIComponent(job.company);
  const l = encodeURIComponent(job.location === 'Remote' ? 'remote' : job.location);
  if (job.portal === 'LinkedIn')
    return `https://www.linkedin.com/jobs/search/?keywords=${t}%20${c}&location=${l}`;
  if (job.portal === 'Indeed')
    return `https://www.indeed.com/jobs?q=${t}&l=${l}`;
  if (job.portal === 'Glassdoor')
    return `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${t}%20${c}`;
  return `https://www.linkedin.com/jobs/search/?keywords=${t}`;
}

function calcMatch(jobSkills, resumeSkills) {
  if (!resumeSkills.length || !jobSkills.length) return 0;
  const matched = jobSkills.filter((s) => resumeSkills.includes(s.toLowerCase())).length;
  return Math.round((matched / jobSkills.length) * 100);
}

const MOCK_JOBS = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    type: 'Full-time',
    portal: 'LinkedIn',
    salary: '$130,000 – $160,000',
    skills: ['React', 'TypeScript', 'Node.js', 'CSS'],
    description: 'Build scalable web applications using modern React and TypeScript.',
    postedDate: '2 days ago',
  },
  {
    id: 2,
    title: 'Full Stack Engineer',
    company: 'StartupXYZ',
    location: 'Remote',
    type: 'Full-time',
    portal: 'Indeed',
    salary: '$110,000 – $140,000',
    skills: ['JavaScript', 'Python', 'PostgreSQL', 'AWS'],
    description: 'Work on both frontend and backend systems for our SaaS product.',
    postedDate: '1 day ago',
  },
  {
    id: 3,
    title: 'Backend Software Engineer',
    company: 'DataSystems LLC',
    location: 'New York, NY',
    type: 'Full-time',
    portal: 'Glassdoor',
    salary: '$120,000 – $150,000',
    skills: ['Python', 'Django', 'PostgreSQL', 'Redis'],
    description: 'Design and implement scalable backend services and APIs.',
    postedDate: '3 days ago',
  },
  {
    id: 4,
    title: 'DevOps Engineer',
    company: 'CloudFirst',
    location: 'Austin, TX',
    type: 'Full-time',
    portal: 'LinkedIn',
    salary: '$125,000 – $155,000',
    skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD'],
    description: 'Manage cloud infrastructure and deployment pipelines.',
    postedDate: '5 days ago',
  },
  {
    id: 5,
    title: 'Machine Learning Engineer',
    company: 'AI Ventures',
    location: 'Remote',
    type: 'Full-time',
    portal: 'Indeed',
    salary: '$140,000 – $180,000',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'Statistics'],
    description: 'Develop and deploy ML models for production systems.',
    postedDate: '1 week ago',
  },
  {
    id: 6,
    title: 'React Native Developer',
    company: 'MobileApps Co.',
    location: 'Chicago, IL',
    type: 'Contract',
    portal: 'Glassdoor',
    salary: '$80/hr – $100/hr',
    skills: ['React Native', 'JavaScript', 'iOS', 'Android'],
    description: 'Build cross-platform mobile apps for iOS and Android.',
    postedDate: '4 days ago',
  },
  {
    id: 7,
    title: 'Data Engineer',
    company: 'Analytics Pro',
    location: 'Seattle, WA',
    type: 'Full-time',
    portal: 'LinkedIn',
    salary: '$115,000 – $145,000',
    skills: ['Spark', 'Kafka', 'Python', 'SQL', 'AWS'],
    description: 'Build and maintain data pipelines and ETL processes.',
    postedDate: '2 days ago',
  },
  {
    id: 8,
    title: 'UI/UX Designer',
    company: 'DesignHub',
    location: 'Remote',
    type: 'Part-time',
    portal: 'Indeed',
    salary: '$70,000 – $90,000',
    skills: ['Figma', 'Adobe XD', 'HTML', 'CSS', 'User Research'],
    description: 'Design intuitive user interfaces and experiences.',
    postedDate: '6 days ago',
  },
  {
    id: 9,
    title: 'Security Engineer',
    company: 'SecureNet',
    location: 'Washington, DC',
    type: 'Full-time',
    portal: 'Glassdoor',
    salary: '$135,000 – $165,000',
    skills: ['Python', 'Security', 'Networking', 'SIEM', 'Penetration Testing'],
    description: 'Protect systems and data from cyber threats.',
    postedDate: '1 week ago',
  },
  {
    id: 10,
    title: 'Product Manager',
    company: 'ProductCo',
    location: 'Boston, MA',
    type: 'Full-time',
    portal: 'LinkedIn',
    salary: '$120,000 – $150,000',
    skills: ['Product Strategy', 'Agile', 'Data Analysis', 'SQL', 'Communication'],
    description: 'Define product vision and roadmap for B2B SaaS platform.',
    postedDate: '3 days ago',
  },
  {
    id: 11,
    title: 'Remote Software Engineer',
    company: 'RemoteFirst Inc.',
    location: 'Remote',
    type: 'Full-time',
    portal: 'LinkedIn',
    salary: '$100,000 – $130,000',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
    description: 'Join a fully remote team building modern web platforms.',
    postedDate: '1 day ago',
  },
  {
    id: 12,
    title: 'Senior Python Developer',
    company: 'ByteWorks',
    location: 'Remote',
    type: 'Full-time',
    portal: 'Indeed',
    salary: '$120,000 – $145,000',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS'],
    description: 'Lead backend development for a high-traffic fintech platform.',
    postedDate: '3 days ago',
  },
];

router.get('/', (req, res) => {
  const { role = '', location = '', portal = '', type = '', skills = '' } = req.query;

  const resumeSkills = skills
    ? skills.split(',').map((s) => s.toLowerCase().trim()).filter(Boolean)
    : [];

  let filtered = MOCK_JOBS;

  if (role || resumeSkills.length) {
    const roleLower = role.toLowerCase();
    filtered = filtered.filter((j) => {
      const matchesRole =
        role &&
        (j.title.toLowerCase().includes(roleLower) ||
          j.skills.some((s) => s.toLowerCase().includes(roleLower)) ||
          j.description.toLowerCase().includes(roleLower));
      const matchesSkills =
        resumeSkills.length > 0 && j.skills.some((s) => resumeSkills.includes(s.toLowerCase()));
      return matchesRole || matchesSkills;
    });
  }

  if (location) {
    const locLower = location.toLowerCase();
    filtered = filtered.filter(
      (j) =>
        j.location.toLowerCase().includes(locLower) ||
        (locLower === 'remote' && j.location.toLowerCase() === 'remote')
    );
  }

  // "Remote" portal filter → location-based remote jobs
  if (portal && portal.toLowerCase() === 'remote') {
    filtered = filtered.filter((j) => j.location.toLowerCase() === 'remote');
  } else if (portal) {
    filtered = filtered.filter((j) => j.portal.toLowerCase() === portal.toLowerCase());
  }

  if (type) {
    filtered = filtered.filter((j) => j.type.toLowerCase() === type.toLowerCase());
  }

  const jobs = filtered.map((j) => ({
    ...j,
    url: portalUrl(j),
    matchPercent: calcMatch(j.skills, resumeSkills),
  }));

  // Sort by match % descending when skills are provided
  if (resumeSkills.length) {
    jobs.sort((a, b) => b.matchPercent - a.matchPercent);
  }

  res.json({ success: true, jobs, total: jobs.length });
});

// Saved jobs
router.get('/saved', (req, res) => {
  try {
    res.json({ success: true, jobs: savedJobsDb.getAll() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch saved jobs' });
  }
});

router.post('/saved', (req, res) => {
  try {
    const job = req.body;
    if (!job || !job.title) return res.status(400).json({ error: 'job data is required' });
    const saved = savedJobsDb.save(job);
    res.status(201).json({ success: true, job: saved });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save job' });
  }
});

router.delete('/saved/:id', (req, res) => {
  try {
    const deleted = savedJobsDb.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Saved job not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete saved job' });
  }
});

export default router;
