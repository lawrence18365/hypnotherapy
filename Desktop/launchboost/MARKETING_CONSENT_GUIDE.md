# Marketing Consent Tracking - IndieSaasDeals

## 📍 **Current Storage Location**

### **localStorage (Temporary)**
When users sign up and check the marketing consent box, their preference is currently stored in:
```javascript
localStorage.setItem('indiesaasdeals-marketing-consent', 'true' | 'false')
```

### **How to Check Current User's Consent:**
1. **Open browser console** on any IndieSaasDeals page
2. **Run this command:**
```javascript
localStorage.getItem('indiesaasdeals-marketing-consent')
// Returns: \"true\", \"false\", or null (if not set)
```

## 🗄️ **Recommended: Database Storage**

### **Step 1: Add Marketing Consent to User Profiles**
Add a column to your `profiles` table:
```sql
ALTER TABLE profiles 
ADD COLUMN marketing_consent BOOLEAN DEFAULT FALSE,
ADD COLUMN marketing_consent_date TIMESTAMP;
```

### **Step 2: Update Profile Creation**
When users sign up, save their marketing consent to the database instead of localStorage.

### **Step 3: Admin Interface**
Create an admin page to view all users' marketing preferences.

## 🔧 **Implementation Files Created:**

1. **`/api/admin/marketing-consent`** - API to get all users' marketing preferences
2. **`/admin/marketing-consent`** - Admin page to view consent data
3. **Updated auth flow** - Saves consent to database on signup

## 📊 **Testing Marketing Consent:**

### **Current Method (localStorage):**
1. Go to sign-up page
2. Check the marketing consent checkbox
3. Sign up with Google/GitHub
4. Open browser console
5. Run: `localStorage.getItem('indiesaasdeals-marketing-consent')`

### **Future Method (Database):**
1. Sign up with marketing consent checked
2. Visit `/admin/marketing-consent` 
3. See all users' consent preferences with timestamps

## 🎯 **Next Steps:**
1. **Test current localStorage system** using browser console
2. **Implement database storage** for production use
3. **Create admin interface** for easy consent management
4. **Set up email marketing integration** based on consent status
