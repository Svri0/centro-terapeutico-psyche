# 🏥 Centro Terapéutico Psyche - Therapeutic Center Management System

## 📋 Project Description

**Centro Terapéutico Psyche** is a comprehensive full-stack web application designed for the complete management of a mental health therapeutic center. This project serves as a **graduation thesis** developed by a team of four students, demonstrating modern web development practices with cutting-edge technologies and collaborative development methodologies.

## 🎯 Key Features

### **For Psychologists & Therapists**

- 📋 **Complete Patient Management** - Comprehensive patient profiles and clinical records
- 📅 **Session Scheduling** - Advanced appointment booking and calendar management
- 📝 **Clinical Notes** - Secure documentation of therapy sessions and progress
- 📊 **Analytics & Reports** - Detailed insights and treatment progress tracking
- 💬 **Patient Communication** - Integrated messaging system with patients

### **For Patients**

- 👤 **Personal Dashboard** - Individual profile and treatment history
- ✅ **Gamified Tasks** - Therapeutic assignments with reward system
- 📱 **Mobile-Optimized** - Responsive design for all devices
- 🎯 **Progress Tracking** - Visual representation of treatment milestones
- 💬 **Secure Chat** - Direct communication with assigned therapist

### **For Administrators**

- 👥 **User Management** - Role-based access control (Admin, Psychologist, Patient, Receptionist)
- 📊 **Center Analytics** - Comprehensive dashboard with key metrics
- 🔍 **Audit System** - Complete activity logging and security monitoring
- ⚙️ **System Configuration** - Centralized settings and preferences

## 🚀 Technology Stack

### **Backend Architecture**

- **Node.js** with **TypeScript** for type-safe development
- **Express.js** - Robust RESTful API framework
- **PostgreSQL** - Reliable relational database
- **Redis** - High-performance caching and sessions
- **Sequelize ORM** - Database abstraction layer
- **JWT Authentication** - Secure token-based authentication
- **Professional Logging System** - Structured logging with multiple levels

### **Frontend Architecture**

- **React 18** with **TypeScript** - Modern component-based UI
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side navigation
- **Responsive Design** - Mobile-first approach

### **Development Tools**

- **ESLint** & **Prettier** - Code quality and formatting
- **Nodemon** - Auto-reload development server
- **Concurrently** - Parallel script execution
- **Docker** - Containerization (optional)
- **Automated Setup Scripts** - One-click development environment

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React/Vite)  │◄──►│  (Node.js/TS)   │◄──►│  (PostgreSQL)   │
│   Port: 3002    │    │   Port: 3004    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│   Redis Cache   │◄─────────────┘
                        │   Port: 6379    │
                        └─────────────────┘
```

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Role-based Access Control** (RBAC)
- **Data Encryption** for sensitive information
- **Input Validation** and sanitization
- **Rate Limiting** and DDoS protection
- **Comprehensive Audit Logging**
- **HTTPS Enforcement** in production

## 📊 Database Schema

### **Core Tables**

- **roles** - System roles and permissions
- **usuarios** - User accounts and authentication
- **pacientes** - Patient clinical and personal data
- **sesiones** - Therapy session records
- **tareas** - Therapeutic assignments and gamification
- **mensajes** - Internal messaging system
- **logs_auditoria** - Complete audit trail

## 🎨 User Interface

### **Modern Design Principles**

- **Clean & Professional** - Medical-grade interface
- **Accessibility First** - WCAG 2.1 compliant
- **Responsive Design** - Works on all devices
- **Intuitive Navigation** - User-friendly experience
- **Dark/Light Mode** - Customizable themes

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/svri0/centro-terapeutico-psyche.git
cd centro-terapeutico-psyche

# Install dependencies
npm install

# Start development servers
npm run dev

# Access the application
# Frontend: http://localhost:3002
# Backend API: http://localhost:3004/api/v1
# Dashboard: http://localhost:3004/dashboard
```

## 📈 Performance Features

- **Intelligent Port Management** - Automatic port detection and allocation
- **Professional Logging** - Structured logs with timestamps and levels
- **Error Handling** - Graceful error management and recovery
- **Caching Strategy** - Redis-based performance optimization
- **Database Optimization** - Efficient queries and indexing

## 🧪 Development Experience

### **Automated Setup**

- **One-command installation** of all dependencies
- **Automatic extension installation** for VSCode/Cursor
- **Terminal configuration** for UTF-8 encoding
- **Pre-configured ESLint and Prettier**

### **Quality Assurance**

- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for consistent formatting
- **Comprehensive documentation**

## 🎓 Academic Project

This **graduation thesis project** demonstrates:

- **Collaborative development** with team of four students
- **Full-stack development** with modern technologies
- **Database design** and management
- **API development** and documentation
- **User interface design** and implementation
- **Security best practices** and implementation
- **DevOps practices** and deployment strategies
- **Project management** and version control
- **Code review** and quality assurance processes

## 📚 Documentation

- **Complete README** with installation instructions
- **API Documentation** with all endpoints
- **Development Setup Guide** for new contributors
- **Troubleshooting Guide** for common issues
- **Architecture Documentation** with system diagrams

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for:

- **Code standards** and best practices
- **Commit message conventions**
- **Pull request process**
- **Development setup**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Development Team

**Graduation Project Team:**

- **Gabriel Godoy** - [@svri0](https://github.com/svri0) - Full-stack Development & Architecture
- **Miguel Román** - Backend Development & Database Design
- **Bairon Campos** - Frontend Development & UI/UX Design
- **Felipe Ríos** - DevOps & System Administration

**Institution:** [Your University Name]  
**Degree:** [Your Degree Program]  
**Year:** 2025

**Project Supervisor:** [Professor Name]  
**Academic Advisor:** [Advisor Name]

---

## 🎯 Project Highlights

✅ **Production-Ready Code** - Enterprise-level architecture  
✅ **Modern Tech Stack** - Latest technologies and best practices  
✅ **Comprehensive Documentation** - Complete setup and usage guides  
✅ **Security Focused** - Industry-standard security measures  
✅ **Scalable Design** - Built for growth and expansion  
✅ **Academic Excellence** - Demonstrates advanced programming skills  
✅ **Team Collaboration** - Four-student graduation project  
✅ **Professional Portfolio** - Industry-standard development practices

**Perfect for graduation presentation and team portfolio! 🎓✨**
