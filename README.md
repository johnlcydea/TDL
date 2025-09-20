# TDL - Secure To-Do List Application

A modern, secure web-based To-Do List application built with Node.js, Express.js, and Google OAuth authentication. This project demonstrates comprehensive security implementations and best practices for web application development.

![TDL App](https://img.shields.io/badge/Status-Active-green) ![Node.js](https://img.shields.io/badge/Node.js-v16+-blue) ![Security](https://img.shields.io/badge/Security-OAuth%202.0-red) ![License](https://img.shields.io/badge/License-MIT-yellow)

## **Features**

### **Core Functionality**
- ✅ **Create, Read, Update, Delete** tasks
- ✅ **Mark tasks** as complete/incomplete
- ✅ **Real-time task management** with instant updates
- ✅ **Responsive design** - works on desktop and mobile
- ✅ **User-specific task isolation** - each user sees only their tasks

### **Security Features**
- **Google OAuth 2.0 Authentication** - secure login without passwords
- **JWT Token-based Authorization** - stateless authentication
- **Role-based Access Control** - user and admin roles
- **Secure Session Management** - HTTP-only cookies
- **Security Headers** - Helmet.js protection
- **Input Validation** - server-side validation and sanitization
- **XSS Protection** - Content Security Policy
- **CSRF Protection** - SameSite cookie configuration

### **Admin Features**
- **Admin Dashboard** - manage all users and tasks
- **User Management** - view all registered users
- **Task Moderation** - delete any user's tasks
- **System Overview** - comprehensive admin controls

## **Technology Stack**

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Passport.js** - Authentication middleware
- **Google OAuth 2.0** - Third-party authentication
- **JWT** - JSON Web Tokens for authorization
- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing

### **Frontend**
- **HTML5** - Semantic markup
- **CSS3** - Modern styling
- **JavaScript (ES6+)** - Interactive functionality
- **Tailwind CSS** - Utility-first CSS framework
- **Responsive Design** - Mobile-first approach

### **Security & Tools**
- **dotenv** - Environment variable management
- **bcrypt-ready** - Password hashing (when needed)
- **express-session** - Session management
- **cookie-parser** - Cookie handling
- **Input sanitization** - XSS prevention

## **Installation & Setup**

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn
- Google Cloud Console account (for OAuth)

### **1. Clone the Repository**
```bash
git clone https://github.com/Sempuri/TDL.git
cd TDL
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Environment Configuration**
1. Copy `.env.example` to `.env`
2. Configure your environment variables:

```env
# Google OAuth (Required)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Server Configuration
PORT=5001
SESSION_SECRET=your_session_secret_here
NODE_ENV=development
```

### **4. Google OAuth Setup**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5001/auth/google/callback`
6. Copy Client ID and Client Secret to your `.env` file

### **5. Run the Application**

#### **Development Mode:**
```bash
npm run real
```

#### **Demo Mode (No OAuth required):**
```bash
npm run demo
```

### **6. Access the Application**
- **Main App:** http://localhost:5001
- **Login Page:** http://localhost:5001/login
- **Admin Dashboard:** http://localhost:5001/admin (admin users only)

## **Security Implementation**

This project implements comprehensive security measures:

### **Authentication & Authorization**
- Google OAuth 2.0 for secure authentication
- JWT tokens for stateless authorization
- Role-based access control (RBAC)
- Secure session management

### **Web Security**
- Helmet.js for security headers
- CORS configuration
- XSS protection with CSP
- CSRF protection with SameSite cookies
- Input validation and sanitization

### **Data Protection**
- Environment variable protection
- Secure cookie configuration
- No password storage (OAuth delegation)
- Parameterized queries (SQL injection prevention)

## 📁 **Project Structure**

```
TDL/
├── public/                 # Frontend files
│   ├── index.html         # Main application page
│   ├── login.html         # Login page
│   ├── admin-dashboard.html # Admin dashboard
│   ├── main.js           # Frontend JavaScript
│   ├── style.css         # Styles
│   └── images/           # Static images
├── server-real.js        # Production server with OAuth
├── server-demo.js        # Demo server (no OAuth required)
├── package.json          # Dependencies and scripts
├── .env.example         # Environment template
├── .env                 # Environment variables (not in repo)
└── README.md           # This file
```

## 🎮 **Usage**

### **For Regular Users:**
1. **Login** with your Google account
2. **Add tasks** using the input field
3. **Edit tasks** by clicking on them
4. **Mark complete** using checkboxes
5. **Delete tasks** with the delete button
6. **Logout** using the logout button

### **For Administrators:**
1. **Login** with admin Google account
2. **Access admin dashboard** at `/admin`
3. **View all users** and their information
4. **Manage all tasks** across all users
5. **Delete any tasks** for moderation

## 🧪 **Available Scripts**

```bash
# Run production server with Google OAuth
npm run real

# Run demo server (no OAuth required)
npm run demo

# Install dependencies
npm install

# Check for vulnerabilities
npm audit
```

## **Configuration Options**

### **Environment Variables**
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret
- `JWT_SECRET` - Secret key for JWT tokens
- `SESSION_SECRET` - Secret key for sessions
- `PORT` - Server port (default: 5001)
- `NODE_ENV` - Environment (development/production)

### **Security Settings**
- Configurable JWT expiration
- Customizable CORS origins
- Adjustable session timeout
- Security header customization

## **Deployment**

### **Production Deployment:**
1. Set `NODE_ENV=production`
2. Configure HTTPS certificates
3. Update OAuth redirect URIs for production domain
4. Set secure cookie flags
5. Configure production database (if using MongoDB)

### **Environment Setup:**
- Use secure, randomly generated secrets
- Enable HTTPS in production
- Configure proper CORS origins
- Set up monitoring and logging

## **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## **Acknowledgments**

- **Google OAuth 2.0** for secure authentication
- **Passport.js** for authentication middleware
- **Helmet.js** for security headers
- **Tailwind CSS** for modern styling
- **Express.js** community for excellent documentation

## **Support**

If you have any questions or need help with setup:

1. Check the [Issues](https://github.com/Sempuri/TDL/issues) page
2. Create a new issue with detailed information
3. Include your Node.js version and OS information

## **Future Enhancements**

- [ ] MongoDB integration for persistent storage
- [ ] Real-time updates with WebSockets
- [ ] Task categories and tags
- [ ] Due dates and reminders
- [ ] Email notifications
- [ ] Mobile app version
- [ ] Team collaboration features
- [ ] Advanced admin analytics

---

**Built with ❤️ for secure web development practices**

*This project demonstrates modern web security implementations and serves as a reference for secure application development.*
