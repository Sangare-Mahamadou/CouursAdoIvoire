export const diplomas = [
  { id: 'bac', label: 'Baccalauréat', hourlyRate: 2500 },
  { id: 'bts', label: 'BTS / DUT', hourlyRate: 3500 },
  { id: 'licence', label: 'Licence', hourlyRate: 5000 },
  { id: 'master', label: 'Master', hourlyRate: 7500 },
  { id: 'doctorat', label: 'Doctorat', hourlyRate: 10000 },
];

export const AVAILABLE_SUBJECTS = [
  'Français',
  'Anglais',
  'Espagnol',
  'Allemand',
  'Histoire-Géographie',
  'Mathématiques',
  'Sciences physiques'
];

export const classLevels = [
  { id: 'cp1', category: 'Primaire', label: 'CP1', baseRate: 0 },
  { id: 'cp2', category: 'Primaire', label: 'CP2', baseRate: 0 },
  { id: 'ce1', category: 'Primaire', label: 'CE1', baseRate: 0 },
  { id: 'ce2', category: 'Primaire', label: 'CE2', baseRate: 0 },
  { id: 'cm1', category: 'Primaire', label: 'CM1', baseRate: 0 },
  { id: 'cm2', category: 'Primaire', label: 'CM2', baseRate: 0 },
  { id: '6eme', category: 'Collège', label: '6ème', baseRate: 500 },
  { id: '5eme', category: 'Collège', label: '5ème', baseRate: 500 },
  { id: '4eme', category: 'Collège', label: '4ème', baseRate: 500 },
  { id: '3eme', category: 'Collège', label: '3ème', baseRate: 1000 },
  { id: '2nde', category: 'Lycée', label: '2nde', baseRate: 1500 },
  { id: '1ere', category: 'Lycée', label: '1ère', baseRate: 1500 },
  { id: 'tle_a', category: 'Terminale', label: 'Terminale A', baseRate: 2000 },
  { id: 'tle_c', category: 'Terminale', label: 'Terminale C', baseRate: 2000 },
  { id: 'tle_d', category: 'Terminale', label: 'Terminale D', baseRate: 2000 },
];

export const teachers = [
  {
    id: 't1',
    firstName: 'Kouamé',
    lastName: 'Jean',
    phone: '+225 01 02 03 04 05',
    diplomaId: 'master',
    subjects: ['Mathématiques', 'Physique'],
    city: 'Abidjan (Cocody)',
    description: 'Professeur de mathématiques passionné avec plus de 5 ans d\'expérience dans le soutien scolaire. Méthodologie adaptée aux élèves en difficulté.',
    rating: 4.8,
    reviewsCount: 12,
  },
  {
    id: 't2',
    firstName: 'Aya',
    lastName: 'Estelle',
    phone: '+225 05 45 67 89 12',
    diplomaId: 'licence',
    subjects: ['Français', 'Anglais'],
    city: 'Abidjan (Yopougon)',
    description: 'Spécialiste en langues, j\'aide vos enfants à maîtriser parfaitement la lecture, l\'orthographe et l\'expression orale et écrite.',
    rating: 4.5,
    reviewsCount: 8,
  },
  {
    id: 't3',
    firstName: 'Touré',
    lastName: 'Oumar',
    phone: '+225 07 11 22 33 44',
    diplomaId: 'doctorat',
    subjects: ['Physique-Chimie', 'SVT'],
    city: 'Yamoussoukro',
    description: 'Enseignant-chercheur. Méthodologie stricte et accompagnement personnalisé pour la réussite aux examens nationaux (BAC, BEPC).',
    rating: 5.0,
    reviewsCount: 25,
  },
  {
    id: 't4',
    firstName: 'Koffi',
    lastName: 'Marc',
    phone: '+225 01 55 66 77 88',
    diplomaId: 'bac',
    subjects: ['Aide aux devoirs', 'Histoire-Géo'],
    city: 'Bouaké',
    description: 'Jeune étudiant dynamique et très motivé pour aider les plus jeunes à faire leurs devoirs du soir et réviser leurs leçons.',
    rating: 4.2,
    reviewsCount: 3,
  }
];

export const parentContracts = [
  {
    id: 'c1',
    teacherId: 't2',
    status: 'En cours',
    startDate: '2026-03-01',
    hoursPerWeek: 4,
    childName: 'Sarah',
    subject: 'Anglais',
    hourlyRate: 5000,
  },
  {
    id: 'c2',
    teacherId: 't1',
    status: 'En attente',
    startDate: '2026-04-05',
    hoursPerWeek: 2,
    childName: 'Marc',
    subject: 'Mathématiques',
    hourlyRate: 7500,
  }
];

export const teacherContracts = [
  {
    id: 'tc1',
    parentId: 'p1',
    parentName: 'M. Konan',
    status: 'En cours',
    startDate: '2026-02-15',
    childName: 'Yannick',
    subject: 'Physique',
    hoursPerWeek: 3
  },
  {
    id: 'tc2',
    parentId: 'p2',
    parentName: 'Mme Bamba',
    status: 'Nouvelle demande',
    startDate: 'A définir',
    childName: 'Fatou',
    subject: 'Mathématiques',
    hoursPerWeek: 2
  }
];
