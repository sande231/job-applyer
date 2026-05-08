import express from 'express';

const router = express.Router();

const MOCK_JOBS = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    type: 'Full-time',
    portal: 'LinkedIn',
    salary: '$130,000 - $160,000',
    skills: ['React', 'TypeScript', 'Node.js', 'CSS'],
    description: 'Build scalable web applications using modern React and TypeScript.',
    postedDate: '2 days ago',
    url: '#',
  },
  {
    id: 2,
    title: 'Full Stack Engineer',
    company: 'StartupXYZ',
    location: 'Remote',
    type: 'Full-time',
    portal: 'Indeed',
    salary: '$110,000 - $140,000',
    skills: ['JavaScript', 'Python', 'PostgreSQL', 'AWS'],
    description: 'Work on both frontend and backend systems for our SaaS product.',
    postedDate: '1 day ago',
    url: '#',
  },
  {
    id: 3,
    title: 'Backend Software Engineer',
    company: 'DataSystems LLC',
    location: 'New York, NY',
    type: 'Full-time',
    portal: 'Glassdoor',
    salary: '$120,000 - $150,000',
    skills: ['Python', 'Django', 'PostgreSQL', 'Redis'],
    description: 'Design and implement scalable backend services and APIs.',
    postedDate: '3 days ago',
    url: '#',
  },
  {
    id: 4,
    title: 'DevOps Engineer',
    company: 'CloudFirst',
    location: 'Austin, TX',
    type: 'Full-time',
    portal: 'LinkedIn',
    salary: '$125,000 - $155,000',
    skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD'],
    description: 'Manage cloud infrastructure and deployment pipelines.',
    postedDate: '5 days ago',
    url: '#',
  },
  {
    id: 5,
    title: 'Machine Learning Engineer',
    company: 'AI Ventures',
    location: 'Remote',
    type: 'Full-time',
    portal: 'Indeed',
    salary: '$140,000 - $180,000',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'Statistics'],
    description: 'Develop and deploy ML models for production systems.',
    postedDate: '1 week ago',
    url: '#',
  },
  {
    id: 6,
    title: 'React Native Developer',
    company: 'MobileApps Co.',
    location: 'Chicago, IL',
    type: 'Contract',
    portal: 'Glassdoor',
    salary: '$80/hr - $100/hr',
    skills: ['React Native', 'JavaScript', 'iOS', 'Android'],
    description: 'Build cross-platform mobile apps for iOS and Android.',
    postedDate: '4 days ago',
    url: '#',
  },
  {
    id: 7,
    title: 'Data Engineer',
    company: 'Analytics Pro',
    location: 'Seattle, WA',
    type: 'Full-time',
    portal: 'LinkedIn',
    salary: '$115,000 - $145,000',
    skills: ['Spark', 'Kafka', 'Python', 'SQL', 'AWS'],
    description: 'Build and maintain data pipelines and ETL processes.',
    postedDate: '2 days ago',
    url: '#',
  },
  {
    id: 8,
    title: 'UI/UX Designer',
    company: 'DesignHub',
    location: 'Remote',
    type: 'Part-time',
    portal: 'Indeed',
    salary: '$70,000 - $90,000',
    skills: ['Figma', 'Adobe XD', 'HTML', 'CSS', 'User Research'],
    description: 'Design intuitive user interfaces and experiences.',
    postedDate: '6 days ago',
    url: '#',
  },
  {
    id: 9,
    title: 'Security Engineer',
    company: 'SecureNet',
    location: 'Washington, DC',
    type: 'Full-time',
    portal: 'Glassdoor',
    salary: '$135,000 - $165,000',
    skills: ['Python', 'Security', 'Networking', 'SIEM', 'Penetration Testing'],
    description: 'Protect systems and data from cyber threats.',
    postedDate: '1 week ago',
    url: '#',
  },
  {
    id: 10,
    title: 'Product Manager',
    company: 'ProductCo',
    location: 'Boston, MA',
    type: 'Full-time',
    portal: 'LinkedIn',
    salary: '$120,000 - $150,000',
    skills: ['Product Strategy', 'Agile', 'Data Analysis', 'SQL', 'Communication'],
    description: 'Define product vision and roadmap for B2B SaaS platform.',
    postedDate: '3 days ago',
    url: '#',
  },
];

router.get('/', (req, res) => {
  const { role = '', location = '', portal = '', type = '' } = req.query;

  let filtered = MOCK_JOBS;

  if (role) {
    const roleLower = role.toLowerCase();
    filtered = filtered.filter(
      (j) =>
        j.title.toLowerCase().includes(roleLower) ||
        j.skills.some((s) => s.toLowerCase().includes(roleLower)) ||
        j.description.toLowerCase().includes(roleLower)
    );
  }

  if (location) {
    const locLower = location.toLowerCase();
    filtered = filtered.filter(
      (j) =>
        j.location.toLowerCase().includes(locLower) ||
        (locLower === 'remote' && j.location.toLowerCase() === 'remote')
    );
  }

  if (portal) {
    filtered = filtered.filter((j) => j.portal.toLowerCase() === portal.toLowerCase());
  }

  if (type) {
    filtered = filtered.filter((j) => j.type.toLowerCase() === type.toLowerCase());
  }

  res.json({ success: true, jobs: filtered, total: filtered.length });
});

export default router;
