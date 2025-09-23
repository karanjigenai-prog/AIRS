/**
 * Skill-to-Training Link Mapping System
 * Provides specific training resources based on the actual skills required
 */

export interface TrainingResource {
  name: string;
  url: string;
  provider: string;
  type: 'course' | 'certification' | 'tutorial' | 'documentation';
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
  cost?: 'free' | 'paid' | 'freemium';
}

export interface SkillTrainingMapping {
  [skillName: string]: TrainingResource[];
}

/**
 * Comprehensive mapping of skills to their specific training resources
 */
export const SKILL_TRAINING_MAPPING: SkillTrainingMapping = {
  // Programming Languages
  'Java': [
    {
      name: 'Java Programming Masterclass',
      url: 'https://www.udemy.com/course/java-the-complete-java-developer-course/',
      provider: 'Udemy',
      type: 'course',
      skillLevel: 'beginner',
      duration: '80 hours',
      cost: 'paid'
    },
    {
      name: 'Oracle Java Certification',
      url: 'https://education.oracle.com/java-certification',
      provider: 'Oracle',
      type: 'certification',
      skillLevel: 'advanced',
      cost: 'paid'
    },
    {
      name: 'Java Tutorials - Oracle',
      url: 'https://docs.oracle.com/javase/tutorial/',
      provider: 'Oracle',
      type: 'tutorial',
      skillLevel: 'beginner',
      cost: 'free'
    }
  ],

  'Python': [
    {
      name: 'Python for Everybody',
      url: 'https://www.coursera.org/specializations/python',
      provider: 'Coursera',
      type: 'course',
      skillLevel: 'beginner',
      duration: '8 months',
      cost: 'freemium'
    },
    {
      name: 'Python Programming - Udemy',
      url: 'https://www.udemy.com/course/complete-python-bootcamp/',
      provider: 'Udemy',
      type: 'course',
      skillLevel: 'beginner',
      duration: '22 hours',
      cost: 'paid'
    },
    {
      name: 'Python.org Tutorial',
      url: 'https://docs.python.org/3/tutorial/',
      provider: 'Python Software Foundation',
      type: 'tutorial',
      skillLevel: 'beginner',
      cost: 'free'
    }
  ],

  'JavaScript': [
    {
      name: 'JavaScript: The Complete Guide',
      url: 'https://www.udemy.com/course/javascript-the-complete-guide-2020-beginner-advanced/',
      provider: 'Udemy',
      type: 'course',
      skillLevel: 'beginner',
      duration: '52 hours',
      cost: 'paid'
    },
    {
      name: 'MDN JavaScript Guide',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
      provider: 'Mozilla',
      type: 'tutorial',
      skillLevel: 'beginner',
      cost: 'free'
    }
  ],

  // Cloud Platforms
  'AWS': [
    {
      name: 'AWS Training and Certification',
      url: 'https://aws.amazon.com/training/',
      provider: 'Amazon Web Services',
      type: 'course',
      skillLevel: 'beginner',
      cost: 'free'
    },
    {
      name: 'AWS Solutions Architect Certification',
      url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
      provider: 'Amazon Web Services',
      type: 'certification',
      skillLevel: 'advanced',
      cost: 'paid'
    },
    {
      name: 'AWS Free Tier',
      url: 'https://aws.amazon.com/free/',
      provider: 'Amazon Web Services',
      type: 'tutorial',
      skillLevel: 'beginner',
      cost: 'free'
    }
  ],

  'Azure': [
    {
      name: 'Microsoft Learn - Azure',
      url: 'https://learn.microsoft.com/en-us/azure/',
      provider: 'Microsoft',
      type: 'course',
      skillLevel: 'beginner',
      cost: 'free'
    },
    {
      name: 'Azure Fundamentals Certification',
      url: 'https://learn.microsoft.com/en-us/certifications/azure-fundamentals/',
      provider: 'Microsoft',
      type: 'certification',
      skillLevel: 'beginner',
      cost: 'paid'
    }
  ],

  'GCP': [
    {
      name: 'Google Cloud Training',
      url: 'https://cloud.google.com/training',
      provider: 'Google Cloud',
      type: 'course',
      skillLevel: 'beginner',
      cost: 'free'
    },
    {
      name: 'Google Cloud Professional Certification',
      url: 'https://cloud.google.com/certification',
      provider: 'Google Cloud',
      type: 'certification',
      skillLevel: 'advanced',
      cost: 'paid'
    }
  ],

  // Container Technologies
  'Kubernetes': [
    {
      name: 'Kubernetes Fundamentals',
      url: 'https://training.linuxfoundation.org/training/kubernetes-fundamentals/',
      provider: 'Linux Foundation',
      type: 'course',
      skillLevel: 'beginner',
      duration: '4 days',
      cost: 'paid'
    },
    {
      name: 'CKA - Certified Kubernetes Administrator',
      url: 'https://www.cncf.io/certification/cka/',
      provider: 'CNCF',
      type: 'certification',
      skillLevel: 'advanced',
      cost: 'paid'
    },
    {
      name: 'Kubernetes Documentation',
      url: 'https://kubernetes.io/docs/home/',
      provider: 'Kubernetes',
      type: 'tutorial',
      skillLevel: 'beginner',
      cost: 'free'
    }
  ],

  'Docker': [
    {
      name: 'Docker for Beginners',
      url: 'https://www.udemy.com/course/docker-mastery/',
      provider: 'Udemy',
      type: 'course',
      skillLevel: 'beginner',
      duration: '20 hours',
      cost: 'paid'
    },
    {
      name: 'Docker Official Documentation',
      url: 'https://docs.docker.com/',
      provider: 'Docker',
      type: 'tutorial',
      skillLevel: 'beginner',
      cost: 'free'
    }
  ],

  // Web Frameworks
  'React': [
    {
      name: 'React - The Complete Guide',
      url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/',
      provider: 'Udemy',
      type: 'course',
      skillLevel: 'beginner',
      duration: '40 hours',
      cost: 'paid'
    },
    {
      name: 'React Official Tutorial',
      url: 'https://react.dev/learn',
      provider: 'React',
      type: 'tutorial',
      skillLevel: 'beginner',
      cost: 'free'
    }
  ],

  'Angular': [
    {
      name: 'Angular - The Complete Guide',
      url: 'https://www.udemy.com/course/the-complete-guide-to-angular-2/',
      provider: 'Udemy',
      type: 'course',
      skillLevel: 'beginner',
      duration: '35 hours',
      cost: 'paid'
    },
    {
      name: 'Angular Documentation',
      url: 'https://angular.io/docs',
      provider: 'Angular',
      type: 'tutorial',
      skillLevel: 'beginner',
      cost: 'free'
    }
  ],

  'Spring Boot': [
    {
      name: 'Spring Boot Masterclass',
      url: 'https://www.udemy.com/course/spring-boot-masterclass/',
      provider: 'Udemy',
      type: 'course',
      skillLevel: 'intermediate',
      duration: '25 hours',
      cost: 'paid'
    },
    {
      name: 'Spring Boot Reference Documentation',
      url: 'https://spring.io/projects/spring-boot',
      provider: 'Spring',
      type: 'tutorial',
      skillLevel: 'beginner',
      cost: 'free'
    }
  ],

  // Data & Analytics
  'Machine Learning': [
    {
      name: 'Machine Learning Course - Stanford',
      url: 'https://www.coursera.org/learn/machine-learning',
      provider: 'Coursera',
      type: 'course',
      skillLevel: 'beginner',
      duration: '11 weeks',
      cost: 'freemium'
    },
    {
      name: 'Deep Learning Specialization',
      url: 'https://www.coursera.org/specializations/deep-learning',
      provider: 'Coursera',
      type: 'course',
      skillLevel: 'intermediate',
      duration: '5 months',
      cost: 'freemium'
    },
    {
      name: 'Fast.ai Practical Deep Learning',
      url: 'https://course.fast.ai/',
      provider: 'Fast.ai',
      type: 'course',
      skillLevel: 'beginner',
      cost: 'free'
    }
  ],

  'Data Science': [
    {
      name: 'Data Science Specialization',
      url: 'https://www.coursera.org/specializations/jhu-data-science',
      provider: 'Coursera',
      type: 'course',
      skillLevel: 'beginner',
      duration: '10 months',
      cost: 'freemium'
    },
    {
      name: 'Python for Data Science',
      url: 'https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/',
      provider: 'Udemy',
      type: 'course',
      skillLevel: 'beginner',
      duration: '25 hours',
      cost: 'paid'
    }
  ],

  'SQL': [
    {
      name: 'SQL for Data Science',
      url: 'https://www.coursera.org/learn/sql-for-data-science',
      provider: 'Coursera',
      type: 'course',
      skillLevel: 'beginner',
      duration: '4 weeks',
      cost: 'freemium'
    },
    {
      name: 'SQL Tutorial - W3Schools',
      url: 'https://www.w3schools.com/sql/',
      provider: 'W3Schools',
      type: 'tutorial',
      skillLevel: 'beginner',
      cost: 'free'
    }
  ],

  // DevOps & Tools
  'Jenkins': [
    {
      name: 'Jenkins Bootcamp',
      url: 'https://www.udemy.com/course/jenkins-from-zero-to-hero/',
      provider: 'Udemy',
      type: 'course',
      skillLevel: 'beginner',
      duration: '15 hours',
      cost: 'paid'
    },
    {
      name: 'Jenkins Documentation',
      url: 'https://www.jenkins.io/doc/',
      provider: 'Jenkins',
      type: 'tutorial',
      skillLevel: 'beginner',
      cost: 'free'
    }
  ],

  'Git': [
    {
      name: 'Git Complete Course',
      url: 'https://www.udemy.com/course/git-complete/',
      provider: 'Udemy',
      type: 'course',
      skillLevel: 'beginner',
      duration: '6 hours',
      cost: 'paid'
    },
    {
      name: 'Git Documentation',
      url: 'https://git-scm.com/doc',
      provider: 'Git',
      type: 'tutorial',
      skillLevel: 'beginner',
      cost: 'free'
    }
  ],

  // Databases
  'MongoDB': [
    {
      name: 'MongoDB University',
      url: 'https://university.mongodb.com/',
      provider: 'MongoDB',
      type: 'course',
      skillLevel: 'beginner',
      cost: 'free'
    },
    {
      name: 'MongoDB Certification',
      url: 'https://university.mongodb.com/certification',
      provider: 'MongoDB',
      type: 'certification',
      skillLevel: 'advanced',
      cost: 'paid'
    }
  ],

  'PostgreSQL': [
    {
      name: 'PostgreSQL Tutorial',
      url: 'https://www.postgresqltutorial.com/',
      provider: 'PostgreSQL Tutorial',
      type: 'tutorial',
      skillLevel: 'beginner',
      cost: 'free'
    },
    {
      name: 'PostgreSQL Documentation',
      url: 'https://www.postgresql.org/docs/',
      provider: 'PostgreSQL',
      type: 'tutorial',
      skillLevel: 'beginner',
      cost: 'free'
    }
  ]
};

/**
 * Get training resources for a specific skill
 */
export function getTrainingResourcesForSkill(skillName: string): TrainingResource[] {
  const normalizedSkill = skillName.toLowerCase().trim();
  
  // Direct match
  if (SKILL_TRAINING_MAPPING[skillName]) {
    return SKILL_TRAINING_MAPPING[skillName];
  }
  
  // Case-insensitive match
  for (const [key, resources] of Object.entries(SKILL_TRAINING_MAPPING)) {
    if (key.toLowerCase() === normalizedSkill) {
      return resources;
    }
  }
  
  // Partial match for variations
  for (const [key, resources] of Object.entries(SKILL_TRAINING_MAPPING)) {
    if (key.toLowerCase().includes(normalizedSkill) || normalizedSkill.includes(key.toLowerCase())) {
      return resources;
    }
  }
  
  // Default fallback for unknown skills
  return [
    {
      name: 'General Programming Resources',
      url: 'https://www.udemy.com/',
      provider: 'Udemy',
      type: 'course',
      skillLevel: 'beginner',
      cost: 'paid'
    },
    {
      name: 'FreeCodeCamp',
      url: 'https://www.freecodecamp.org/',
      provider: 'FreeCodeCamp',
      type: 'course',
      skillLevel: 'beginner',
      cost: 'free'
    }
  ];
}

/**
 * Get training resources for multiple skills
 */
export function getTrainingResourcesForSkills(skills: string[]): { [skill: string]: TrainingResource[] } {
  const result: { [skill: string]: TrainingResource[] } = {};
  
  skills.forEach(skill => {
    result[skill] = getTrainingResourcesForSkill(skill);
  });
  
  return result;
}

/**
 * Get the best training resource for a skill (prioritizes free and official resources)
 */
export function getBestTrainingResourceForSkill(skillName: string): TrainingResource {
  const resources = getTrainingResourcesForSkill(skillName);
  
  // Prioritize free resources first
  const freeResources = resources.filter(r => r.cost === 'free');
  if (freeResources.length > 0) {
    return freeResources[0];
  }
  
  // Then official documentation/tutorials
  const officialResources = resources.filter(r => r.type === 'tutorial' || r.type === 'documentation');
  if (officialResources.length > 0) {
    return officialResources[0];
  }
  
  // Finally, return the first available resource
  return resources[0];
}

/**
 * Generate training links HTML for email templates
 */
export function generateTrainingLinksHTML(skills: string[]): string {
  const trainingResources = getTrainingResourcesForSkills(skills);
  
  let html = '<div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0;">';
  html += '<h4 style="margin-top: 0; color: #495057;">📚 Recommended Training Resources:</h4>';
  
  Object.entries(trainingResources).forEach(([skill, resources]) => {
    html += `<h5 style="color: #6c757d; margin: 10px 0 5px 0;">${skill}:</h5>`;
    html += '<ul style="margin: 5px 0 15px 0; padding-left: 20px;">';
    
    resources.slice(0, 2).forEach(resource => { // Limit to top 2 resources per skill
      const costBadge = resource.cost === 'free' ? '🆓' : '💰';
      const typeBadge = resource.type === 'certification' ? '🏆' : '📖';
      html += `<li style="margin: 3px 0;">${costBadge} ${typeBadge} <a href="${resource.url}" target="_blank" style="color: #007bff; text-decoration: none;">${resource.name}</a> (${resource.provider})</li>`;
    });
    
    html += '</ul>';
  });
  
  html += '</div>';
  return html;
}

/**
 * Generate training links text for email templates
 */
export function generateTrainingLinksText(skills: string[]): string {
  const trainingResources = getTrainingResourcesForSkills(skills);
  
  let text = 'Training Resources:\n\n';
  
  Object.entries(trainingResources).forEach(([skill, resources]) => {
    text += `${skill}:\n`;
    resources.slice(0, 2).forEach(resource => { // Limit to top 2 resources per skill
      const costBadge = resource.cost === 'free' ? '[FREE]' : '[PAID]';
      const typeBadge = resource.type === 'certification' ? '[CERT]' : '[COURSE]';
      text += `- ${costBadge} ${typeBadge} ${resource.name}: ${resource.url}\n`;
    });
    text += '\n';
  });
  
  return text;
}
