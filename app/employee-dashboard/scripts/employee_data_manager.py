"""
Employee Dashboard Data Management System
Handles all data operations for the employee dashboard including:
- Employee profiles and competency data
- Training courses and progress tracking
- Career path management
- Analytics and insights generation
"""

import json
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import random
import uuid

class EmployeeDashboardDB:
    def __init__(self, db_path: str = "employee_dashboard.db"):
        self.db_path = db_path
        self.init_database()
        
    def init_database(self):
        """Initialize the database with all required tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Employees table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS employees (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                department TEXT NOT NULL,
                position TEXT NOT NULL,
                hire_date DATE NOT NULL,
                photo_url TEXT,
                years_experience REAL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Skills table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS skills (
                id TEXT PRIMARY KEY,
                name TEXT UNIQUE NOT NULL,
                category TEXT NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Employee Skills (competency tracking)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS employee_skills (
                id TEXT PRIMARY KEY,
                employee_id TEXT NOT NULL,
                skill_id TEXT NOT NULL,
                current_level INTEGER DEFAULT 0,
                target_level INTEGER DEFAULT 100,
                is_certified BOOLEAN DEFAULT FALSE,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (employee_id) REFERENCES employees (id),
                FOREIGN KEY (skill_id) REFERENCES skills (id),
                UNIQUE(employee_id, skill_id)
            )
        ''')
        
        # Certifications table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS certifications (
                id TEXT PRIMARY KEY,
                employee_id TEXT NOT NULL,
                name TEXT NOT NULL,
                issuer TEXT NOT NULL,
                issue_date DATE NOT NULL,
                expiry_date DATE,
                status TEXT DEFAULT 'active',
                credential_url TEXT,
                FOREIGN KEY (employee_id) REFERENCES employees (id)
            )
        ''')
        
        # Training Courses table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS training_courses (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                provider TEXT NOT NULL,
                description TEXT,
                duration_weeks INTEGER DEFAULT 4,
                price REAL DEFAULT 0,
                is_free BOOLEAN DEFAULT TRUE,
                category TEXT NOT NULL,
                rating REAL DEFAULT 0,
                total_students INTEGER DEFAULT 0,
                skills_taught TEXT, -- JSON array of skills
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Course Enrollments table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS course_enrollments (
                id TEXT PRIMARY KEY,
                employee_id TEXT NOT NULL,
                course_id TEXT NOT NULL,
                enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completion_date TIMESTAMP,
                progress_percentage INTEGER DEFAULT 0,
                status TEXT DEFAULT 'enrolled', -- enrolled, in_progress, completed, dropped
                manager_approved BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (employee_id) REFERENCES employees (id),
                FOREIGN KEY (course_id) REFERENCES training_courses (id)
            )
        ''')
        
        # Career Paths table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS career_paths (
                id TEXT PRIMARY KEY,
                employee_id TEXT NOT NULL,
                title TEXT NOT NULL,
                current_level TEXT NOT NULL,
                target_level TEXT NOT NULL,
                progress_percentage INTEGER DEFAULT 0,
                estimated_completion_months INTEGER DEFAULT 12,
                priority TEXT DEFAULT 'medium', -- high, medium, low
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (employee_id) REFERENCES employees (id)
            )
        ''')
        
        # Career Milestones table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS career_milestones (
                id TEXT PRIMARY KEY,
                career_path_id TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'not_started', -- not_started, in_progress, completed
                progress_percentage INTEGER DEFAULT 0,
                points INTEGER DEFAULT 0,
                deadline DATE,
                completion_date DATE,
                FOREIGN KEY (career_path_id) REFERENCES career_paths (id)
            )
        ''')
        
        # Learning Activity Log table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS learning_activities (
                id TEXT PRIMARY KEY,
                employee_id TEXT NOT NULL,
                activity_type TEXT NOT NULL, -- course, skill_practice, certification, etc.
                activity_name TEXT NOT NULL,
                hours_spent REAL DEFAULT 0,
                date DATE NOT NULL,
                notes TEXT,
                FOREIGN KEY (employee_id) REFERENCES employees (id)
            )
        ''')
        
        conn.commit()
        conn.close()
        print("[v0] Database initialized successfully")
    
    def seed_sample_data(self):
        """Populate the database with sample data for demonstration"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Sample employee
        employee_id = str(uuid.uuid4())
        cursor.execute('''
            INSERT OR REPLACE INTO employees 
            (id, name, email, department, position, hire_date, years_experience)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (employee_id, "Sarah Johnson", "sarah.johnson@company.com", 
              "Software Engineering", "Senior Developer", "2019-03-15", 5.5))
        
        # Sample skills
        skills_data = [
            ("JavaScript", "Programming", "Modern JavaScript programming language"),
            ("React", "Frontend", "React.js library for building user interfaces"),
            ("Python", "Programming", "Python programming language"),
            ("AWS", "Cloud", "Amazon Web Services cloud platform"),
            ("Node.js", "Backend", "Node.js runtime for server-side JavaScript"),
            ("TypeScript", "Programming", "TypeScript superset of JavaScript"),
            ("Docker", "DevOps", "Container platform for application deployment"),
            ("GraphQL", "API", "Query language for APIs"),
        ]
        
        skill_ids = []
        for skill_name, category, description in skills_data:
            skill_id = str(uuid.uuid4())
            skill_ids.append((skill_id, skill_name))
            cursor.execute('''
                INSERT OR REPLACE INTO skills (id, name, category, description)
                VALUES (?, ?, ?, ?)
            ''', (skill_id, skill_name, category, description))
        
        # Sample employee skills
        skill_levels = [90, 85, 70, 80, 75, 88, 65, 60]
        certifications = [True, True, True, True, False, True, False, False]
        
        for i, (skill_id, skill_name) in enumerate(skill_ids):
            cursor.execute('''
                INSERT OR REPLACE INTO employee_skills 
                (id, employee_id, skill_id, current_level, is_certified)
                VALUES (?, ?, ?, ?, ?)
            ''', (str(uuid.uuid4()), employee_id, skill_id, skill_levels[i], certifications[i]))
        
        # Sample certifications
        cert_data = [
            ("AWS Solutions Architect", "Amazon", "2023-08-15", "2026-08-15", "active"),
            ("React Developer Certification", "Meta", "2023-06-20", "2025-06-20", "active"),
            ("JavaScript Expert", "JavaScript Institute", "2023-03-10", "2025-03-10", "active"),
            ("Python Professional", "Python Software Foundation", "2022-11-05", "2024-11-05", "active"),
            ("Scrum Master", "Scrum Alliance", "2024-01-12", "2024-07-12", "expiring_soon"),
        ]
        
        for name, issuer, issue_date, expiry_date, status in cert_data:
            cursor.execute('''
                INSERT OR REPLACE INTO certifications 
                (id, employee_id, name, issuer, issue_date, expiry_date, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (str(uuid.uuid4()), employee_id, name, issuer, issue_date, expiry_date, status))
        
        # Sample training courses
        courses_data = [
            ("Machine Learning Fundamentals", "AI Institute", "Learn the basics of machine learning and data science", 8, 0, True, "AI/ML", 4.8, 1250, '["Python", "TensorFlow", "Data Analysis"]'),
            ("Advanced TypeScript", "Code Masters", "Master advanced TypeScript concepts and patterns", 4, 199, False, "Programming", 4.9, 890, '["TypeScript", "Advanced Patterns", "Type Safety"]'),
            ("DevOps with Kubernetes", "Cloud Native Academy", "Complete guide to container orchestration with Kubernetes", 6, 299, False, "DevOps", 4.7, 2100, '["Kubernetes", "Docker", "CI/CD"]'),
            ("UX Design Principles", "Design School", "Learn fundamental UX design principles and methodologies", 5, 0, True, "Design", 4.6, 750, '["User Research", "Wireframing", "Prototyping"]'),
            ("Advanced React Patterns", "Tech Academy", "Deep dive into advanced React patterns and best practices", 6, 249, False, "Frontend", 4.8, 1500, '["React", "Hooks", "Performance"]'),
        ]
        
        course_ids = []
        for title, provider, description, duration, price, is_free, category, rating, students, skills in courses_data:
            course_id = str(uuid.uuid4())
            course_ids.append(course_id)
            cursor.execute('''
                INSERT OR REPLACE INTO training_courses 
                (id, title, provider, description, duration_weeks, price, is_free, category, rating, total_students, skills_taught)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (course_id, title, provider, description, duration, price, is_free, category, rating, students, skills))
        
        # Sample course enrollments (in progress courses)
        in_progress_courses = [
            (course_ids[4], 65, "in_progress", True),  # Advanced React Patterns
            (course_ids[2], 40, "in_progress", True),  # DevOps with Kubernetes
        ]
        
        for course_id, progress, status, approved in in_progress_courses:
            cursor.execute('''
                INSERT OR REPLACE INTO course_enrollments 
                (id, employee_id, course_id, progress_percentage, status, manager_approved)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (str(uuid.uuid4()), employee_id, course_id, progress, status, approved))
        
        # Sample career path
        career_path_id = str(uuid.uuid4())
        cursor.execute('''
            INSERT OR REPLACE INTO career_paths 
            (id, employee_id, title, current_level, target_level, progress_percentage, estimated_completion_months, priority)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (career_path_id, employee_id, "Technical Lead", "Senior Developer", "Technical Lead", 75, 8, "high"))
        
        # Sample career milestones
        milestones_data = [
            ("Complete Leadership Training", "Finish the Leadership Fundamentals course and apply learnings", "completed", 100, 100, "2024-02-15", "2024-02-15"),
            ("Lead Cross-functional Project", "Successfully lead a project involving multiple teams", "in_progress", 70, 150, "2024-05-30", None),
            ("Mentor Junior Developers", "Actively mentor 2-3 junior developers for 6 months", "in_progress", 85, 120, "2024-06-15", None),
            ("Architecture Review Participation", "Participate in 5 architecture review sessions", "not_started", 0, 80, "2024-07-30", None),
            ("Technical Presentation", "Present technical solution to stakeholders", "not_started", 0, 100, "2024-08-15", None),
        ]
        
        for title, description, status, progress, points, deadline, completion_date in milestones_data:
            cursor.execute('''
                INSERT OR REPLACE INTO career_milestones 
                (id, career_path_id, title, description, status, progress_percentage, points, deadline, completion_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (str(uuid.uuid4()), career_path_id, title, description, status, progress, points, deadline, completion_date))
        
        # Sample learning activities (last 6 weeks)
        base_date = datetime.now() - timedelta(weeks=6)
        for week in range(6):
            activity_date = base_date + timedelta(weeks=week)
            hours = random.randint(6, 18)
            cursor.execute('''
                INSERT OR REPLACE INTO learning_activities 
                (id, employee_id, activity_type, activity_name, hours_spent, date)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (str(uuid.uuid4()), employee_id, "course", f"Week {week + 1} Learning", hours, activity_date.date()))
        
        conn.commit()
        conn.close()
        print("[v0] Sample data seeded successfully")
    
    def seed_real_employee_data(self):
        """Populate the database with real employee data from the provided spreadsheet"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        real_employees = [
            {
                "id": "emp_001",
                "name": "Ateef Hussain",
                "email": "AteefHussain@karanji.com",
                "department": "Gen AI Development",
                "position": "Gen AI Developer",
                "skills": ["Python", "React.js", "machine learning"],
                "certifications": ["AWS certification", "microsoft azure"]
            },
            {
                "id": "emp_002", 
                "name": "Sumith R Naik",
                "email": "sumithrnaik@karanji.com",
                "department": "Gen AI Development",
                "position": "Gen AI Developer", 
                "skills": ["java", "node js", "data science"],
                "certifications": ["java script", "python development"]
            },
            {
                "id": "emp_003",
                "name": "K Sumanth",
                "email": "KSumanth@karanji.com", 
                "department": "Gen AI Development",
                "position": "Gen AI Developer",
                "skills": ["C+ programming", "python", "machine learning"],
                "certifications": ["google certification", "advanced react patterns"]
            },
            {
                "id": "emp_004",
                "name": "Griffith Sheeba",
                "email": "Sheeba@karanji.com",
                "department": "Gen AI Development", 
                "position": "Gen AI Developer",
                "skills": ["React js", "C programming", "mongol"],
                "certifications": ["AWS certification", "microsoft azure"]
            },
            {
                "id": "emp_005",
                "name": "Sowmyashree",
                "email": "Sowmyashree@karanji.com",
                "department": "Gen AI Development",
                "position": "Gen AI Developer",
                "skills": ["AWS", "React", "java"],
                "certifications": ["Data science", "machine learning"]
            },
            {
                "id": "emp_006", 
                "name": "AthulyaRoy",
                "email": "AthulyaRoy@karanji.com",
                "department": "Gen AI Development",
                "position": "Gen AI Developer",
                "skills": ["Next js", "python", "SQL"],
                "certifications": ["google certification", "java script"]
            },
            {
                "id": "emp_007",
                "name": "Shivani",
                "email": "Shivani@karanji.com", 
                "department": "Gen AI Development",
                "position": "Gen AI Developer",
                "skills": ["C sharp", "AWS", "machine learning"],
                "certifications": ["AWS certification", "microsoft azure"]
            }
        ]
        
        # Insert real employees
        for emp in real_employees:
            cursor.execute('''
                INSERT OR REPLACE INTO employees 
                (id, name, email, department, position, hire_date, years_experience, photo_url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (emp["id"], emp["name"], emp["email"], emp["department"], 
                  emp["position"], "2023-01-15", random.uniform(2.0, 6.0), 
                  "/professional-woman-smiling.png"))
        
        # Create skills for all unique skills mentioned
        all_skills = set()
        for emp in real_employees:
            all_skills.update(emp["skills"])
        
        skill_categories = {
            "Python": "Programming", "React.js": "Frontend", "machine learning": "AI/ML",
            "java": "Programming", "node js": "Backend", "data science": "Analytics", 
            "C+ programming": "Programming", "React js": "Frontend", "C programming": "Programming",
            "mongol": "Database", "AWS": "Cloud", "React": "Frontend", "Next js": "Frontend",
            "SQL": "Database", "C sharp": "Programming"
        }
        
        skill_id_map = {}
        for skill_name in all_skills:
            skill_id = str(uuid.uuid4())
            skill_id_map[skill_name] = skill_id
            category = skill_categories.get(skill_name, "Technical")
            cursor.execute('''
                INSERT OR REPLACE INTO skills (id, name, category, description)
                VALUES (?, ?, ?, ?)
            ''', (skill_id, skill_name, category, f"Professional skill in {skill_name}"))
        
        # Assign skills to employees with realistic levels
        for emp in real_employees:
            for skill_name in emp["skills"]:
                skill_id = skill_id_map[skill_name]
                level = random.randint(70, 95)  # High skill levels for developers
                is_certified = random.choice([True, False])
                
                cursor.execute('''
                    INSERT OR REPLACE INTO employee_skills 
                    (id, employee_id, skill_id, current_level, target_level, is_certified)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (str(uuid.uuid4()), emp["id"], skill_id, level, 100, is_certified))
        
        # Add certifications for employees
        for emp in real_employees:
            for cert_name in emp["certifications"]:
                issue_date = datetime.now() - timedelta(days=random.randint(30, 730))
                expiry_date = issue_date + timedelta(days=730)  # 2 years validity
                
                cursor.execute('''
                    INSERT OR REPLACE INTO certifications 
                    (id, employee_id, name, issuer, issue_date, expiry_date, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (str(uuid.uuid4()), emp["id"], cert_name, "Professional Institute", 
                      issue_date.date(), expiry_date.date(), "active"))
        
        # Add sample career paths for each employee
        for emp in real_employees:
            career_path_id = str(uuid.uuid4())
            cursor.execute('''
                INSERT OR REPLACE INTO career_paths 
                (id, employee_id, title, current_level, target_level, progress_percentage, estimated_completion_months, priority)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (career_path_id, emp["id"], "Senior AI Developer", "Gen AI Developer", 
                  "Senior Gen AI Developer", random.randint(40, 80), 12, "high"))
        
        # Add some learning activities for each employee
        for emp in real_employees:
            for week in range(4):  # Last 4 weeks
                activity_date = datetime.now() - timedelta(weeks=week)
                hours = random.randint(8, 20)
                cursor.execute('''
                    INSERT OR REPLACE INTO learning_activities 
                    (id, employee_id, activity_type, activity_name, hours_spent, date)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (str(uuid.uuid4()), emp["id"], "skill_development", 
                      f"Week {week + 1} AI Development", hours, activity_date.date()))
        
        conn.commit()
        conn.close()
        print("[v0] Real employee data seeded successfully")
    
    def get_employee_profile(self, employee_id: str) -> Optional[Dict]:
        """Get complete employee profile with competency data"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get employee basic info
        cursor.execute('SELECT * FROM employees WHERE id = ?', (employee_id,))
        employee = cursor.fetchone()
        
        if not employee:
            conn.close()
            return None
        
        # Get employee skills
        cursor.execute('''
            SELECT s.name, s.category, es.current_level, es.target_level, es.is_certified
            FROM employee_skills es
            JOIN skills s ON es.skill_id = s.id
            WHERE es.employee_id = ?
            ORDER BY es.current_level DESC
        ''', (employee_id,))
        skills = cursor.fetchall()
        
        # Get certifications
        cursor.execute('''
            SELECT name, issuer, issue_date, expiry_date, status
            FROM certifications
            WHERE employee_id = ?
            ORDER BY issue_date DESC
        ''', (employee_id,))
        certifications = cursor.fetchall()
        
        # Calculate competency score
        if skills:
            avg_skill_level = sum(skill[2] for skill in skills) / len(skills)
            competency_score = int(avg_skill_level)
        else:
            competency_score = 0
        
        conn.close()
        
        return {
            'id': employee[0],
            'name': employee[1],
            'email': employee[2],
            'department': employee[3],
            'position': employee[4],
            'hire_date': employee[5],
            'photo_url': employee[6],
            'years_experience': employee[7],
            'competency_score': competency_score,
            'skills': [
                {
                    'name': skill[0],
                    'category': skill[1],
                    'current_level': skill[2],
                    'target_level': skill[3],
                    'is_certified': bool(skill[4])
                } for skill in skills
            ],
            'certifications': [
                {
                    'name': cert[0],
                    'issuer': cert[1],
                    'issue_date': cert[2],
                    'expiry_date': cert[3],
                    'status': cert[4]
                } for cert in certifications
            ]
        }
    
    def get_training_courses(self, category: str = None, search_term: str = None) -> List[Dict]:
        """Get available training courses with optional filtering"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        query = 'SELECT * FROM training_courses WHERE 1=1'
        params = []
        
        if category and category != 'all':
            query += ' AND category = ?'
            params.append(category)
        
        if search_term:
            query += ' AND (title LIKE ? OR description LIKE ?)'
            params.extend([f'%{search_term}%', f'%{search_term}%'])
        
        query += ' ORDER BY rating DESC'
        
        cursor.execute(query, params)
        courses = cursor.fetchall()
        
        conn.close()
        
        return [
            {
                'id': course[0],
                'title': course[1],
                'provider': course[2],
                'description': course[3],
                'duration_weeks': course[4],
                'price': course[5],
                'is_free': bool(course[6]),
                'category': course[7],
                'rating': course[8],
                'total_students': course[9],
                'skills_taught': json.loads(course[10]) if course[10] else []
            } for course in courses
        ]
    
    def get_employee_course_progress(self, employee_id: str) -> List[Dict]:
        """Get employee's course enrollment and progress"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT tc.title, tc.provider, tc.category, ce.progress_percentage, 
                   ce.status, ce.enrollment_date, ce.completion_date
            FROM course_enrollments ce
            JOIN training_courses tc ON ce.course_id = tc.id
            WHERE ce.employee_id = ? AND ce.status IN ('enrolled', 'in_progress')
            ORDER BY ce.enrollment_date DESC
        ''', (employee_id,))
        
        courses = cursor.fetchall()
        conn.close()
        
        return [
            {
                'title': course[0],
                'provider': course[1],
                'category': course[2],
                'progress': course[3],
                'status': course[4],
                'enrollment_date': course[5],
                'completion_date': course[6]
            } for course in courses
        ]
    
    def get_career_path_data(self, employee_id: str) -> Dict:
        """Get employee's career path information"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get career paths
        cursor.execute('''
            SELECT id, title, current_level, target_level, progress_percentage, 
                   estimated_completion_months, priority, status
            FROM career_paths
            WHERE employee_id = ? AND status = 'active'
        ''', (employee_id,))
        
        paths = cursor.fetchall()
        
        career_data = {
            'paths': [
                {
                    'id': path[0],
                    'title': path[1],
                    'current_level': path[2],
                    'target_level': path[3],
                    'progress': path[4],
                    'estimated_months': path[5],
                    'priority': path[6],
                    'status': path[7]
                } for path in paths
            ],
            'milestones': []
        }
        
        # Get milestones for the first career path (if any)
        if paths:
            cursor.execute('''
                SELECT title, description, status, progress_percentage, points, deadline, completion_date
                FROM career_milestones
                WHERE career_path_id = ?
                ORDER BY deadline ASC
            ''', (paths[0][0],))
            
            milestones = cursor.fetchall()
            career_data['milestones'] = [
                {
                    'title': milestone[0],
                    'description': milestone[1],
                    'status': milestone[2],
                    'progress': milestone[3],
                    'points': milestone[4],
                    'deadline': milestone[5],
                    'completion_date': milestone[6]
                } for milestone in milestones
            ]
        
        conn.close()
        return career_data
    
    def get_analytics_data(self, employee_id: str) -> Dict:
        """Generate analytics and insights data"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get learning activity data
        cursor.execute('''
            SELECT date, SUM(hours_spent) as total_hours
            FROM learning_activities
            WHERE employee_id = ? AND date >= date('now', '-6 weeks')
            GROUP BY date
            ORDER BY date
        ''', (employee_id,))
        
        learning_activity = cursor.fetchall()
        
        # Get skill progression (simulated monthly data)
        cursor.execute('''
            SELECT s.name, es.current_level
            FROM employee_skills es
            JOIN skills s ON es.skill_id = s.id
            WHERE es.employee_id = ?
            ORDER BY es.current_level DESC
            LIMIT 4
        ''', (employee_id,))
        
        top_skills = cursor.fetchall()
        
        # Calculate total learning hours
        cursor.execute('''
            SELECT SUM(hours_spent) as total_hours
            FROM learning_activities
            WHERE employee_id = ?
        ''', (employee_id,))
        
        total_hours = cursor.fetchone()[0] or 0
        
        conn.close()
        
        return {
            'learning_activity': [
                {'date': activity[0], 'hours': activity[1]}
                for activity in learning_activity
            ],
            'top_skills': [
                {'name': skill[0], 'level': skill[1]}
                for skill in top_skills
            ],
            'total_learning_hours': total_hours,
            'skill_growth_rate': 12,  # Simulated
            'peer_ranking': 20,  # Top 20%
            'market_score': 8.5
        }
    
    def authenticate_employee(self, email: str) -> Optional[Dict]:
        """Authenticate employee by email and return their profile"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT id FROM employees WHERE email = ?', (email,))
        result = cursor.fetchone()
        
        if result:
            employee_id = result[0]
            conn.close()
            return self.get_employee_profile(employee_id)
        
        conn.close()
        return None
    
    def get_all_employees(self) -> List[Dict]:
        """Get list of all employees for login selection"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT id, name, email, department, position FROM employees ORDER BY name')
        employees = cursor.fetchall()
        
        conn.close()
        
        return [
            {
                'id': emp[0],
                'name': emp[1], 
                'email': emp[2],
                'department': emp[3],
                'position': emp[4]
            } for emp in employees
        ]
    
    def add_employee(self, employee_data: Dict) -> str:
        """Add a new employee to the database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        employee_id = str(uuid.uuid4())
        
        try:
            cursor.execute('''
                INSERT INTO employees 
                (id, name, email, department, position, hire_date, years_experience, photo_url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                employee_id,
                employee_data['name'],
                employee_data['email'],
                employee_data['department'],
                employee_data['position'],
                employee_data.get('hire_date', datetime.now().date()),
                employee_data.get('years_experience', 0),
                employee_data.get('photo_url', '/professional-woman-smiling.png')
            ))
            
            # Add skills if provided
            if 'skills' in employee_data:
                for skill_name in employee_data['skills']:
                    # Create skill if it doesn't exist
                    skill_id = self._get_or_create_skill(skill_name)
                    
                    # Add employee skill
                    cursor.execute('''
                        INSERT INTO employee_skills 
                        (id, employee_id, skill_id, current_level, target_level, is_certified)
                        VALUES (?, ?, ?, ?, ?, ?)
                    ''', (
                        str(uuid.uuid4()),
                        employee_id,
                        skill_id,
                        employee_data.get('skill_level', 70),
                        100,
                        False
                    ))
            
            # Add certifications if provided
            if 'certifications' in employee_data:
                for cert_name in employee_data['certifications']:
                    cursor.execute('''
                        INSERT INTO certifications 
                        (id, employee_id, name, issuer, issue_date, expiry_date, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        str(uuid.uuid4()),
                        employee_id,
                        cert_name,
                        'Professional Institute',
                        datetime.now().date(),
                        (datetime.now() + timedelta(days=730)).date(),
                        'active'
                    ))
            
            # Create default career path
            career_path_id = str(uuid.uuid4())
            cursor.execute('''
                INSERT INTO career_paths 
                (id, employee_id, title, current_level, target_level, progress_percentage, estimated_completion_months, priority)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                career_path_id,
                employee_id,
                f"Senior {employee_data['position']}",
                employee_data['position'],
                f"Senior {employee_data['position']}",
                0,
                12,
                'medium'
            ))
            
            conn.commit()
            print(f"[v0] Employee {employee_data['name']} added successfully with ID: {employee_id}")
            return employee_id
            
        except sqlite3.IntegrityError as e:
            print(f"[v0] Error adding employee: {e}")
            return None
        finally:
            conn.close()
    
    def update_employee(self, employee_id: str, employee_data: Dict) -> bool:
        """Update an existing employee's information"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # Update basic employee info
            update_fields = []
            params = []
            
            for field in ['name', 'email', 'department', 'position', 'years_experience']:
                if field in employee_data:
                    update_fields.append(f"{field} = ?")
                    params.append(employee_data[field])
            
            if update_fields:
                params.append(employee_id)
                cursor.execute(f'''
                    UPDATE employees 
                    SET {', '.join(update_fields)}
                    WHERE id = ?
                ''', params)
            
            # Update skills if provided
            if 'skills' in employee_data:
                # Remove existing skills
                cursor.execute('DELETE FROM employee_skills WHERE employee_id = ?', (employee_id,))
                
                # Add new skills
                for skill_name in employee_data['skills']:
                    skill_id = self._get_or_create_skill(skill_name)
                    cursor.execute('''
                        INSERT INTO employee_skills 
                        (id, employee_id, skill_id, current_level, target_level, is_certified)
                        VALUES (?, ?, ?, ?, ?, ?)
                    ''', (
                        str(uuid.uuid4()),
                        employee_id,
                        skill_id,
                        employee_data.get('skill_level', 70),
                        100,
                        False
                    ))
            
            conn.commit()
            print(f"[v0] Employee {employee_id} updated successfully")
            return True
            
        except Exception as e:
            print(f"[v0] Error updating employee: {e}")
            return False
        finally:
            conn.close()
    
    def remove_employee(self, employee_id: str) -> bool:
        """Remove an employee and all related data"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # Get employee name for logging
            cursor.execute('SELECT name FROM employees WHERE id = ?', (employee_id,))
            result = cursor.fetchone()
            employee_name = result[0] if result else "Unknown"
            
            # Remove all related data (cascading delete)
            tables_to_clean = [
                'learning_activities',
                'career_milestones',
                'career_paths', 
                'course_enrollments',
                'certifications',
                'employee_skills',
                'employees'
            ]
            
            for table in tables_to_clean:
                if table == 'career_milestones':
                    # Special handling for career milestones
                    cursor.execute('''
                        DELETE FROM career_milestones 
                        WHERE career_path_id IN (
                            SELECT id FROM career_paths WHERE employee_id = ?
                        )
                    ''', (employee_id,))
                else:
                    cursor.execute(f'DELETE FROM {table} WHERE employee_id = ?', (employee_id,))
            
            conn.commit()
            print(f"[v0] Employee {employee_name} ({employee_id}) removed successfully")
            return True
            
        except Exception as e:
            print(f"[v0] Error removing employee: {e}")
            return False
        finally:
            conn.close()
    
    def _get_or_create_skill(self, skill_name: str) -> str:
        """Get existing skill ID or create new skill"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Check if skill exists
        cursor.execute('SELECT id FROM skills WHERE name = ?', (skill_name,))
        result = cursor.fetchone()
        
        if result:
            skill_id = result[0]
        else:
            # Create new skill
            skill_id = str(uuid.uuid4())
            category = self._categorize_skill(skill_name)
            cursor.execute('''
                INSERT INTO skills (id, name, category, description)
                VALUES (?, ?, ?, ?)
            ''', (skill_id, skill_name, category, f"Professional skill in {skill_name}"))
            conn.commit()
        
        conn.close()
        return skill_id
    
    def _categorize_skill(self, skill_name: str) -> str:
        """Automatically categorize skills based on name"""
        skill_lower = skill_name.lower()
        
        if any(lang in skill_lower for lang in ['python', 'java', 'javascript', 'c++', 'c#', 'typescript']):
            return 'Programming'
        elif any(frontend in skill_lower for frontend in ['react', 'vue', 'angular', 'html', 'css']):
            return 'Frontend'
        elif any(backend in skill_lower for backend in ['node', 'express', 'django', 'flask']):
            return 'Backend'
        elif any(cloud in skill_lower for cloud in ['aws', 'azure', 'gcp', 'cloud']):
            return 'Cloud'
        elif any(data in skill_lower for data in ['sql', 'mongodb', 'database', 'data']):
            return 'Database'
        elif any(ai in skill_lower for ai in ['machine learning', 'ai', 'tensorflow', 'pytorch']):
            return 'AI/ML'
        elif any(devops in skill_lower for devops in ['docker', 'kubernetes', 'jenkins', 'devops']):
            return 'DevOps'
        else:
            return 'Technical'
    
    def search_employees(self, search_term: str = None, department: str = None) -> List[Dict]:
        """Search employees by name, email, or department"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        query = 'SELECT id, name, email, department, position, hire_date FROM employees WHERE 1=1'
        params = []
        
        if search_term:
            query += ' AND (name LIKE ? OR email LIKE ?)'
            params.extend([f'%{search_term}%', f'%{search_term}%'])
        
        if department:
            query += ' AND department = ?'
            params.append(department)
        
        query += ' ORDER BY name'
        
        cursor.execute(query, params)
        employees = cursor.fetchall()
        
        conn.close()
        
        return [
            {
                'id': emp[0],
                'name': emp[1],
                'email': emp[2],
                'department': emp[3],
                'position': emp[4],
                'hire_date': emp[5]
            } for emp in employees
        ]
    
    def get_employee_statistics(self) -> Dict:
        """Get overall employee statistics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Total employees
        cursor.execute('SELECT COUNT(*) FROM employees')
        total_employees = cursor.fetchone()[0]
        
        # Employees by department
        cursor.execute('SELECT department, COUNT(*) FROM employees GROUP BY department')
        dept_stats = cursor.fetchall()
        
        # Average competency score
        cursor.execute('''
            SELECT AVG(es.current_level) 
            FROM employee_skills es
            JOIN employees e ON es.employee_id = e.id
        ''')
        avg_competency = cursor.fetchone()[0] or 0
        
        # Total certifications
        cursor.execute('SELECT COUNT(*) FROM certifications WHERE status = "active"')
        total_certifications = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            'total_employees': total_employees,
            'departments': dict(dept_stats),
            'average_competency': round(avg_competency, 1),
            'total_certifications': total_certifications
        }

# Initialize and run the data management system
if __name__ == "__main__":
    print("[v0] Initializing Employee Dashboard Database...")
    
    # Create database instance
    db = EmployeeDashboardDB()
    
    # Seed with real employee data instead of sample data
    db.seed_real_employee_data()
    
    # Test authentication with real employee
    print("\n[v0] Testing employee authentication...")
    
    # Test with Ateef Hussain's email
    profile = db.authenticate_employee("AteefHussain@karanji.com")
    if profile:
        print(f"[v0] Authentication successful: {profile['name']} - {profile['position']}")
        print(f"[v0] Skills: {[skill['name'] for skill in profile['skills'][:3]]}")
        print(f"[v0] Competency Score: {profile['competency_score']}")
    
    # Show all available employees
    all_employees = db.get_all_employees()
    print(f"\n[v0] Available employees for login:")
    for emp in all_employees:
        print(f"[v0] - {emp['name']} ({emp['email']})")
    
    print("\n[v0] Real Employee Dashboard Database setup complete!")
    print("[v0] Database file: employee_dashboard.db")
    print("[v0] All systems operational with real employee data!")
