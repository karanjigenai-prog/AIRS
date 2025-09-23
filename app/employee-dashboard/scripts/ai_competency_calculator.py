"""
AI-Powered Competency Score Calculator
Calculates employee competency scores using various factors:
- Skill levels and certifications
- Learning activity and progress
- Project contributions and peer feedback
- Industry benchmarks and trends
"""

import sqlite3
import json
import math
from datetime import datetime, timedelta
from typing import Dict, List, Tuple

class AICompetencyCalculator:
    def __init__(self, db_path: str = "employee_dashboard.db"):
        self.db_path = db_path
        
        # Weights for different competency factors
        self.weights = {
            'skill_proficiency': 0.35,      # 35% - Current skill levels
            'certifications': 0.20,         # 20% - Professional certifications
            'learning_velocity': 0.15,      # 15% - Rate of skill improvement
            'practical_application': 0.15,  # 15% - Project work and experience
            'industry_relevance': 0.10,     # 10% - Market demand for skills
            'peer_collaboration': 0.05      # 5% - Teamwork and mentoring
        }
        
        # Industry demand multipliers for different skill categories
        self.industry_demand = {
            'AI/ML': 1.3,
            'Cloud': 1.25,
            'Programming': 1.1,
            'Frontend': 1.05,
            'Backend': 1.1,
            'DevOps': 1.2,
            'Design': 1.0,
            'Management': 1.15,
            'Leadership': 1.2
        }
    
    def calculate_competency_score(self, employee_id: str) -> Dict:
        """Calculate comprehensive AI-powered competency score"""
        conn = sqlite3.connect(self.db_path)
        
        # Get all competency factors
        skill_score = self._calculate_skill_proficiency(conn, employee_id)
        cert_score = self._calculate_certification_score(conn, employee_id)
        learning_score = self._calculate_learning_velocity(conn, employee_id)
        application_score = self._calculate_practical_application(conn, employee_id)
        relevance_score = self._calculate_industry_relevance(conn, employee_id)
        collaboration_score = self._calculate_peer_collaboration(conn, employee_id)
        
        # Calculate weighted total
        total_score = (
            skill_score * self.weights['skill_proficiency'] +
            cert_score * self.weights['certifications'] +
            learning_score * self.weights['learning_velocity'] +
            application_score * self.weights['practical_application'] +
            relevance_score * self.weights['industry_relevance'] +
            collaboration_score * self.weights['peer_collaboration']
        )
        
        conn.close()
        
        # Ensure score is between 0-100
        final_score = max(0, min(100, int(total_score)))
        
        return {
            'overall_score': final_score,
            'breakdown': {
                'skill_proficiency': round(skill_score, 1),
                'certifications': round(cert_score, 1),
                'learning_velocity': round(learning_score, 1),
                'practical_application': round(application_score, 1),
                'industry_relevance': round(relevance_score, 1),
                'peer_collaboration': round(collaboration_score, 1)
            },
            'performance_level': self._get_performance_level(final_score),
            'recommendations': self._generate_recommendations(employee_id, {
                'skill_proficiency': skill_score,
                'certifications': cert_score,
                'learning_velocity': learning_score,
                'practical_application': application_score,
                'industry_relevance': relevance_score,
                'peer_collaboration': collaboration_score
            })
        }
    
    def _calculate_skill_proficiency(self, conn: sqlite3.Connection, employee_id: str) -> float:
        """Calculate score based on current skill levels"""
        cursor = conn.cursor()
        cursor.execute('''
            SELECT es.current_level, s.category
            FROM employee_skills es
            JOIN skills s ON es.skill_id = s.id
            WHERE es.employee_id = ?
        ''', (employee_id,))
        
        skills = cursor.fetchall()
        
        if not skills:
            return 0
        
        # Calculate weighted average based on industry demand
        total_weighted_score = 0
        total_weight = 0
        
        for level, category in skills:
            weight = self.industry_demand.get(category, 1.0)
            total_weighted_score += level * weight
            total_weight += weight
        
        return total_weighted_score / total_weight if total_weight > 0 else 0
    
    def _calculate_certification_score(self, conn: sqlite3.Connection, employee_id: str) -> float:
        """Calculate score based on professional certifications"""
        cursor = conn.cursor()
        cursor.execute('''
            SELECT COUNT(*) as active_certs,
                   COUNT(CASE WHEN status = 'expiring_soon' THEN 1 END) as expiring_certs
            FROM certifications
            WHERE employee_id = ? AND status IN ('active', 'expiring_soon')
        ''', (employee_id,))
        
        cert_data = cursor.fetchone()
        active_certs, expiring_certs = cert_data
        
        # Base score from number of certifications
        base_score = min(100, active_certs * 15)  # 15 points per cert, max 100
        
        # Penalty for expiring certifications
        expiry_penalty = expiring_certs * 5
        
        return max(0, base_score - expiry_penalty)
    
    def _calculate_learning_velocity(self, conn: sqlite3.Connection, employee_id: str) -> float:
        """Calculate score based on learning activity and progress"""
        cursor = conn.cursor()
        
        # Get learning hours in last 3 months
        cursor.execute('''
            SELECT SUM(hours_spent) as total_hours
            FROM learning_activities
            WHERE employee_id = ? AND date >= date('now', '-3 months')
        ''', (employee_id,))
        
        recent_hours = cursor.fetchone()[0] or 0
        
        # Get course completion rate
        cursor.execute('''
            SELECT 
                COUNT(*) as total_enrollments,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_courses,
                AVG(progress_percentage) as avg_progress
            FROM course_enrollments
            WHERE employee_id = ?
        ''', (employee_id,))
        
        course_data = cursor.fetchone()
        total_enrollments, completed_courses, avg_progress = course_data
        avg_progress = avg_progress or 0
        
        # Calculate learning velocity score
        hours_score = min(100, recent_hours * 2)  # 2 points per hour, max 100
        completion_rate = (completed_courses / total_enrollments * 100) if total_enrollments > 0 else 0
        progress_score = avg_progress
        
        return (hours_score * 0.4 + completion_rate * 0.3 + progress_score * 0.3)
    
    def _calculate_practical_application(self, conn: sqlite3.Connection, employee_id: str) -> float:
        """Calculate score based on practical experience and project work"""
        cursor = conn.cursor()
        
        # Get employee experience
        cursor.execute('SELECT years_experience FROM employees WHERE id = ?', (employee_id,))
        years_exp = cursor.fetchone()[0] or 0
        
        # Experience score (logarithmic scale to prevent over-weighting)
        exp_score = min(100, 20 * math.log(years_exp + 1))
        
        # Simulated project contribution score (in real implementation, this would come from project data)
        project_score = 75  # Placeholder for project performance metrics
        
        return (exp_score * 0.6 + project_score * 0.4)
    
    def _calculate_industry_relevance(self, conn: sqlite3.Connection, employee_id: str) -> float:
        """Calculate score based on how relevant skills are to current market"""
        cursor = conn.cursor()
        cursor.execute('''
            SELECT s.category, es.current_level
            FROM employee_skills es
            JOIN skills s ON es.skill_id = s.id
            WHERE es.employee_id = ?
        ''', (employee_id,))
        
        skills = cursor.fetchall()
        
        if not skills:
            return 0
        
        # Calculate relevance score based on industry demand
        relevance_scores = []
        for category, level in skills:
            demand_multiplier = self.industry_demand.get(category, 1.0)
            relevance_score = level * demand_multiplier
            relevance_scores.append(relevance_score)
        
        return sum(relevance_scores) / len(relevance_scores)
    
    def _calculate_peer_collaboration(self, conn: sqlite3.Connection, employee_id: str) -> float:
        """Calculate score based on collaboration and mentoring activities"""
        # In a real implementation, this would analyze:
        # - Code review participation
        # - Mentoring activities
        # - Team collaboration metrics
        # - Knowledge sharing contributions
        
        # For now, return a simulated score based on seniority
        cursor = conn.cursor()
        cursor.execute('SELECT position FROM employees WHERE id = ?', (employee_id,))
        position = cursor.fetchone()[0]
        
        # Senior positions get higher collaboration scores
        if 'Senior' in position:
            return 80
        elif 'Lead' in position or 'Manager' in position:
            return 90
        else:
            return 65
    
    def _get_performance_level(self, score: int) -> str:
        """Convert numeric score to performance level"""
        if score >= 90:
            return "Exceptional"
        elif score >= 80:
            return "Excellent"
        elif score >= 70:
            return "Good"
        elif score >= 60:
            return "Satisfactory"
        else:
            return "Needs Improvement"
    
    def _generate_recommendations(self, employee_id: str, scores: Dict) -> List[str]:
        """Generate personalized recommendations based on competency analysis"""
        recommendations = []
        
        # Skill proficiency recommendations
        if scores['skill_proficiency'] < 75:
            recommendations.append("Focus on improving core technical skills through hands-on practice")
        
        # Certification recommendations
        if scores['certifications'] < 60:
            recommendations.append("Consider pursuing industry-recognized certifications in your field")
        
        # Learning velocity recommendations
        if scores['learning_velocity'] < 70:
            recommendations.append("Increase learning activity by enrolling in more courses or training programs")
        
        # Industry relevance recommendations
        if scores['industry_relevance'] < 80:
            recommendations.append("Focus on high-demand skills like AI/ML, Cloud Computing, or DevOps")
        
        # Collaboration recommendations
        if scores['peer_collaboration'] < 75:
            recommendations.append("Engage more in team activities, mentoring, and knowledge sharing")
        
        # General recommendations
        if len(recommendations) == 0:
            recommendations.append("Maintain your excellent performance and consider leadership opportunities")
        
        return recommendations

# Test the AI competency calculator
if __name__ == "__main__":
    print("[v0] Testing AI Competency Calculator...")
    
    calculator = AICompetencyCalculator()
    
    # Get employee ID for testing
    conn = sqlite3.connect("employee_dashboard.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, name FROM employees LIMIT 1")
    employee_data = cursor.fetchone()
    conn.close()
    
    if employee_data:
        employee_id, employee_name = employee_data
        
        print(f"[v0] Calculating competency score for {employee_name}...")
        result = calculator.calculate_competency_score(employee_id)
        
        print(f"\n[v0] === COMPETENCY ANALYSIS RESULTS ===")
        print(f"[v0] Overall Score: {result['overall_score']}/100")
        print(f"[v0] Performance Level: {result['performance_level']}")
        
        print(f"\n[v0] Score Breakdown:")
        for factor, score in result['breakdown'].items():
            print(f"[v0]   {factor.replace('_', ' ').title()}: {score}/100")
        
        print(f"\n[v0] Recommendations:")
        for i, rec in enumerate(result['recommendations'], 1):
            print(f"[v0]   {i}. {rec}")
        
        print(f"\n[v0] AI Competency Calculator test completed successfully!")
    else:
        print("[v0] No employee data found. Please run employee_data_manager.py first.")
