# Firebase Setup Instructions

## Important: Admin Setup Required

Before users can log in, you need to set up users in Firebase:

### 1. Go to Firebase Console
Visit: https://console.firebase.google.com/project/dispensarymanagementsystem

### 2. Enable Email/Password Authentication
- Go to **Authentication** → **Sign-in method**
- Enable **Email/Password** provider
- Click **Save**

### 3. Create Users
- Go to **Authentication** → **Users**
- Click **Add user**
- Create the doctor account:
  - **Email**: doctor@dispensary.com
  - **Password**: admin1234
  - Click **Add user**

### 4. Set User Roles in Firestore
- Go to **Firestore Database**
- Create a collection called **users**
- For each user created, add a document:
  - Document ID: Use the UID from Authentication
  - Fields:
    ```
    email: "doctor@dispensary.com"
    role: "doctor"
    displayName: "Dr. Username"
    ```

### Example User Document Structure:
```
Collection: users
Document ID: [User UID from Authentication]
{
  email: "doctor@dispensary.com",
  role: "doctor",
  displayName: "Dr. Smith"
}
```

### Supported Roles:
- **doctor** → Redirects to /doctor-dashboard
- **admin** → Redirects to /admin-dashboard
- **pharmacist** → Redirects to /pharmacy-inventory

### 5. Test Login
- Run your application
- Login with:
  - Username: doctor@dispensary.com
  - Password: admin1234
- You should be redirected to the doctor dashboard

## Security Notes
- Users can only be created by admin through Firebase Console
- Regular users cannot register themselves
- Each user must have a corresponding Firestore document with their role
- Change default passwords after first login
