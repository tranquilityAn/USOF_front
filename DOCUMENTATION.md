# Full-Fledged Documentation - USOF Frontend

## ⚡ Description

**USOF** is a full-featured web application that provides an interface for interacting with a RESTful API from the **USOF Backend** challenge.  
The frontend is developed with **React** and **Redux**, following modern development standards, and delivers an intuitive, responsive user interface for managing posts, comments, categories, users, and authentication.

### 🎯 Goal
Create a complete user interface for the provided API, implementing all required functionalities - registration, authentication, post creation, editing, commenting, liking, and user management - while maintaining performance, usability, and attractive design.

---

## 🧩 Tech Stack and Dependencies

**Core Technologies:**
- React 18+
- Redux Toolkit
- React Router DOM
- Axios
- React Hook Form + Zod
- TinyMCE (for post editor)
- CSS Modules (custom styling)
- JavaScript (ES6+)

**Dev Tools:**
- Node.js ≥ 18
- npm ≥ 9 or yarn ≥ 1.22
- Redux DevTools (browser extension)

---

## 🖥️ Project Structure

```
frontend/
├── public/
├── src/
│   ├── app/               # Redux store & API setup
│   ├── components/        # Reusable UI components
│   ├── features/          # Feature slices (auth, posts, favorites, etc.)
│   ├── pages/             # Route-based pages
│   ├── routes/            # Router configuration
│   ├── utils/             # Helper functions
│   ├── styles/            # Global and module CSS
│   └── index.js           # App entry point
├── package.json
└── README.md
```

---

## 🧠 Algorithm and Functionality

### 1. Authentication
- Registration and login via API.
- Email verification flow.
- Token-based authentication stored in Redux state.
- Access control for protected routes.

### 2. Main Page
- Displays the latest posts fetched from API (`/posts` endpoint).
- Sorting and filtering options by date, rating, and category.
- Pagination.

### 3. Post Page
- Full post content view.
- Like/dislike and favorite actions.
- Nested comments (comment replies).
- Sorting comments by likes.

### 4. User Profile
- Displays user data (login, full name, rating, post count).
- List of user’s posts with pagination.
- Ability to edit personal information and avatar.

### 5. Admin Access (if role = admin)
- Access to admin panel pages (categories, users, etc.).
- Hidden from non-admin users.

### 6. Favorites Page
- Displays posts saved by the user as favorites.

### 7. Search Functionality
- Search bar for authenticated users.
- Supports searching by post titles and author logins.

---

## ⚙️ How to Run the Project

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/usof-frontend.git
cd usof-frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
Create `.env` file in the project root:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Start the development server
```bash
npm start
```

### 5. Open in browser
```
http://localhost:3000
```

---

## 📸 Screenshots (to be added by you)

Add screenshots illustrating:
1. **Home page** with posts list.  
2. **Login and registration pages**.  
3. **User profile page** (authorized view).  
4. **Single post page** with comments.  
5. **Admin panel or favorites page**.  

---

## 📈 Progress by Challenge Phases (CBL Stages)

### ENGAGE
- Identified the difference between frontends for regular sites and API-based apps.
- Studied React and Redux structure.
- Defined main app routes and user roles.

### INVESTIGATE
- Analyzed backend endpoints and mapped them to frontend features.
- Planned Redux slices: `auth`, `posts`, `favorites`, `users`, `comments`.
- Designed responsive layout and component hierarchy.

### ACT: BASIC
- Implemented core pages (home, profile, post, login/register).
- Connected frontend to backend API.
- Added authentication and input validation.
- Implemented pagination and sorting for posts.
- Added comments with nested replies and likes.

### ACT: CREATIVE
- Implemented **favorites** system.
- Added **live UI updates** after likes/dislikes.
- Made **user login clickable** (navigates to author’s profile).
- Added **responsive design** for mobile devices.
- Unified **authorization styling** (Auth.module.css).
- Added **search bar** visible only for authenticated users.

### DOCUMENT
- Created `README.md` and this full-fledged documentation file.
- Added clear run instructions and dependency list.
- Structured code following Google and Airbnb style guides.

### SHARE
- To be published on LinkedIn with project screenshots and reflection.
  - Include hashtags: `#InnovationCampusKhPI #FullStackTrack`
  - Mention `@Innovation Campus of NTU "KhPI"`

---

## 🧩 API Integration Overview

Each feature communicates with backend endpoints:
| Feature | Endpoint | Method |
|----------|-----------|--------|
| Register | `/api/auth/register` | POST |
| Login | `/api/auth/login` | POST |
| Get posts | `/api/posts` | GET |
| Create post | `/api/posts` | POST |
| Edit post | `/api/posts/:id` | PATCH |
| Comment | `/api/comments` | POST |
| Like | `/api/posts/:id/like` | POST |
| Favorites | `/api/favorites` | GET/POST/DELETE |
| Profile | `/api/users/:login` | GET |
| Verify email | `/api/auth/verify-email/:token` | GET |

---

## 📱 Responsive Design

- Layout built with **Flexbox** and CSS modules.
- Supports mobile, tablet, and desktop views.
- Profile page becomes a single-column layout on small screens.

---

## 🔐 Security & Validation

- JWT stored securely in Redux state (not in localStorage).
- Frontend input validation via **Zod** schema.
- API errors handled and displayed clearly in UI.
- Unauthorized users restricted from protected routes.

---

## 🧭 Future Improvements

- Implement post sharing on social media.
- Add dark/light theme toggle.
- Introduce user activity statistics dashboard.
- Improve comment sorting and filtering UI.

---

## 🏁 Conclusion

The **USOF Frontend** project demonstrates a complete implementation of an API-driven web interface built using modern frontend technologies. It follows software engineering best practices, ensures clean architecture, and emphasizes user experience and maintainability.  

It serves as both a **learning exercise** in full-stack development and a **foundation for scalable web applications**.