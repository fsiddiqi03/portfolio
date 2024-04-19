// gitprofile.config.ts

const CONFIG = {
  github: {
    username: 'fsiddiqi03', // Your GitHub org/user name. (This is the only required config)
  },
  /**
   * If you are deploying to https://<USERNAME>.github.io/, for example your repository is at https://github.com/arifszn/arifszn.github.io, set base to '/'.
   * If you are deploying to https://<USERNAME>.github.io/<REPO_NAME>/,
   * for example your repository is at https://github.com/arifszn/portfolio, then set base to '/portfolio/'.
   */
  base: '/portfolio/',
  projects: {
    github: {
      display: true, // Display GitHub projects?
      header: 'Github Projects',
      mode: 'automatic', // Mode can be: 'automatic' or 'manual'
      automatic: {
        sortBy: 'updated', // Sort projects by 'stars' or 'updated'
        limit: 8, // How many projects to display.
        exclude: {
          forks: true, // Forked projects will not be displayed if set to true.
          projects: ['fsiddiqi03/fsiddiqi03', 'fsiddiqi03/portfolio', 'fsiddiqi03/Personal-Portfolio',], // These projects will not be displayed. example: ['arifszn/my-project1', 'arifszn/my-project2']
        },
      },
      manual: {
        // Properties for manually specifying projects
        projects: [ ], // List of repository names to display. example: ['arifszn/my-project1', 'arifszn/my-project2']
      },
    },
    external: {
      header: '',
      // To hide the `External Projects` section, keep it empty.
      projects: [
      
        
      ],
    },
  },
  seo: {
    title: 'Portfolio of Faris Siddiqi',
    description: 'Incoming SWE intern @ RR Donnelley | CS @ Loyola University Chicago',
    imageURL: 'https://drive.google.com/file/d/1eaNHOthgH_6-LA6b8ZmEWESmmQwvstki/view?usp=sharing',
  },
  social: {
    linkedin: 'faris-siddiqi',
    twitter: '',
    mastodon: '',
    researchGate: '',
    facebook: '',
    instagram: 'faris.visuals',
    youtube: '', // example: 'pewdiepie'
    dribbble: '',
    behance: '',
    medium: '',
    dev: '',
    stackoverflow: '', // example: '1/jeff-atwood'
    skype: '',
    telegram: '',
    website: '',
    phone: '',
    email: 'farissiddiqi@gmail.com',
  },
  resume: {
    fileUrl:
      'https://drive.google.com/file/d/1p7aoCvFEU00XgShhJP_1WqaRO8xnXoQN/view?usp=sharing', // Empty fileUrl will hide the `Download Resume` button.
  },
  skills: [
    'Java',
    'AWS',
    'Terraform',
    'Python',
    'React.js',
    'Node.js',
    'MySQL',
    'Git',
    'Docker',
    'CSS',
    'HTML',
    'TypeScript',
    'REST API',
    'NoSql',
    'SQL',
    'GCP',
    'GO',
    'JavaScript',
  ],
  experiences: [
    {
      company: 'RR Donnelley',
      position: 'Software Engineer Intern',
      from: 'May 2024',
      to: 'August 20024',
      companyLink: '',
    },
    {
      company: 'GoSTEM',
      position: 'High School Python Instructor',
      from: 'January 2024',
      to: 'May 2024',
      companyLink: '',
    },
  ],
  certifications: [
   
  ],
  educations: [
    {
      institution: 'Loyola University Chicago',
      degree: 'BS in Computer Science',
      from: '2021',
      to: '2026',
    },
  ],
  publications: [
   
  ],
  // Display articles from your medium or dev account. (Optional)
  blog: {
    source: '', // medium | dev
    username: '', // to hide blog section, keep it empty
    limit: 2, // How many articles to display. Max is 10.
  },
  googleAnalytics: {
    id: '', // GA3 tracking id/GA4 tag id UA-XXXXXXXXX-X | G-XXXXXXXXXX
  },
  // Track visitor interaction and behavior. https://www.hotjar.com
  hotjar: {
    id: '',
    snippetVersion: 6,
  },
  themeConfig: {
    defaultTheme: 'lofi',

    // Hides the switch in the navbar
    // Useful if you want to support a single color mode
    disableSwitch: false,

    // Should use the prefers-color-scheme media-query,
    // using user system preferences, instead of the hardcoded defaultTheme
    respectPrefersColorScheme: false,

    // Display the ring in Profile picture
    displayAvatarRing: true,

    // Available themes. To remove any theme, exclude from here.
    themes: [
      'light',
      'dark',
      'cupcake',
      'bumblebee',
      'emerald',
      'corporate',
      'synthwave',
      'retro',
      'cyberpunk',
      'valentine',
      'halloween',
      'garden',
      'forest',
      'aqua',
      'lofi',
      'pastel',
      'fantasy',
      'wireframe',
      'black',
      'luxury',
      'dracula',
      'cmyk',
      'autumn',
      'business',
      'acid',
      'lemonade',
      'night',
      'coffee',
      'winter',
      'dim',
      'nord',
      'sunset',
      'procyon',
    ],

    // Custom theme, applied to `procyon` theme
    customTheme: {
      primary: '#fc055b',
      secondary: '#219aaf',
      accent: '#e8d03a',
      neutral: '#2A2730',
      'base-100': '#E3E3ED',
      '--rounded-box': '3rem',
      '--rounded-btn': '3rem',
    },
  },

  // Optional Footer. Supports plain text or HTML.
  footer: `Made with <a 
      rel="noreferrer"
    >GitProfile</a> and ❤️`,

  enablePWA: true,
};

export default CONFIG;
