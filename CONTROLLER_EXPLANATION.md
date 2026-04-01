# Backend Controllers Deep Dive

https://app.eraser.io/workspace/jlTQL4OxTvZz6nNblN5x?origin=share

This document provides a comprehensive explanation of how each controller in the `/backend/controllers` directory works, including detailed breakdowns of keywords, their purposes, and examples of how they interact with the frontend.

## Table of Contents

1. [Job Controller](#job-controller)
2. [Application Controller](#application-controller)
3. [Company Controller](#company-controller)
4. [Saved Job Controller](#saved-job-controller)
5. [User Controller](#user-controller)

---

## Job Controller

**File**: `backend/controllers/job.controller.js`

The job controller handles all job-related operations including CRUD operations, filtering, and job posting.

### 1. `postJob` Function

```javascript
export const postJob = async (req, res) => {
    try {
        const {
            title,
            description,
            requirements,
            salary,
            location,
            jobType,
            experienceLevel,
            position,
            companyId
        } = req.body;

        const userId = req.id; // Extracted from auth middleware

        if (
            !title ||
            !description ||
            !requirements ||
            !salary ||
            !location ||
            !jobType ||
            experienceLevel === undefined ||
            !position ||
            !companyId
        ) {
            return res.status(400).json({
                message: "Something is missing.",
                success: false
            });
        }

        const job = await Job.create({
            title,
            description,
            requirements: requirements ? requirements.split(",") : [],
            salary: Number(salary), // MUST be number (LPA)
            location,
            jobType,
            experienceLevel: Number(experienceLevel),
            position: Number(position),
            company: companyId,
            created_by: userId
        });

        return res.status(201).json({
            message: "New job created successfully.",
            success: true,
            job
        });

    } catch (error) {
        console.log("POST JOB ERROR:", error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};
```

**Key Components Explained:**

- **`req.id`**: Extracted from authentication middleware, represents the authenticated user's ID
- **`requirements.split(",")`**: Converts comma-separated string to array for database storage
- **`Number(salary)`**: Ensures salary is stored as a number (LPA - Lakhs Per Annum)
- **`created_by: userId`**: Links the job to the user who created it
- **Status 201**: Indicates successful resource creation

**Frontend Integration Example:**
```javascript
// Frontend: PostJob.jsx
const submitHandler = async (e) => {
    e.preventDefault();
    const res = await axios.post(`${JOB_API_END_POINT}/post`, input, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
    });
};
```

### 2. `getAllJobs` Function

```javascript
export const getAllJobs = async (req, res) => {
    try {
        const {
            keyword = "",
            location,
            industry,
            minSalary,
            maxSalary
        } = req.query;

        let query = {};

        // 🔍 keyword search
        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } }
            ];
        }

        // 📍 location filter
        if (location) {
            query.location = { $regex: location, $options: "i" };
        }

        // 🏢 industry filter (based on title)
        if (industry) {
            query.title = { $regex: industry, $options: "i" };
        }

        // 💰 salary filter (LPA)
        if (minSalary && maxSalary) {
            query.salary = {
                $gte: Number(minSalary),
                $lte: Number(maxSalary)
            };
        }

        const jobs = await Job.find(query)
            .populate({ path: "company" })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            jobs,
            success: true
        });

    } catch (error) {
        console.log("GET ALL JOB ERROR:", error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};
```

**Key Components Explained:**

- **`req.query`**: Extracts query parameters from URL (e.g., `?keyword=react&location=bangalore`)
- **`$or` operator**: MongoDB operator for OR logic in queries
- **`$regex`**: Regular expression for pattern matching with case-insensitive flag `"i"`
- **`$gte` and `$lte`**: MongoDB operators for "greater than or equal" and "less than or equal"
- **`populate({ path: "company" })`**: Mongoose method to fetch referenced company data
- **`sort({ createdAt: -1 })`**: Sorts by creation date in descending order (newest first)

**Frontend Integration Example:**
```javascript
// Frontend: useGetAllJobs.jsx
const fetchAllJobs = async () => {
    const res = await axios.get(`${JOB_API_END_POINT}/get?keyword=${searchedQuery}`, {
        withCredentials: true
    });
};
```

### 3. `getJobById` Function

```javascript
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;

        const job = await Job.findById(jobId)
            .populate({ path: "applications" });

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        return res.status(200).json({
            job,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false });
    }
};
```

**Key Components Explained:**

- **`req.params.id`**: Extracts the job ID from URL parameters (e.g., `/jobs/123`)
- **`findById()`**: Mongoose method to find a document by its ID
- **`populate({ path: "applications" })`**: Fetches all applications for this job

**Frontend Integration Example:**
```javascript
// Frontend: JobDescription.jsx
const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, {
    withCredentials: true
});
```

### 4. `getAdminJobs` Function

```javascript
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;

        const jobs = await Job.find({ created_by: adminId })
            .populate({ path: "company" })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            jobs,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false });
    }
};
```

**Key Components Explained:**

- **`{ created_by: adminId }`**: Filters jobs by the user who created them
- Used specifically for admin/recruiter dashboard to show only their posted jobs

**Frontend Integration Example:**
```javascript
// Frontend: useGetAllAdminJobs.jsx
const res = await axios.get(`${JOB_API_END_POINT}/getadminjobs`, {
    withCredentials: true
});
```

### 5. `updateJob` and `deleteJob` Functions

```javascript
export const updateJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const {
            title, description, requirements, salary, location,
            jobType, experienceLevel, position
        } = req.body;

        const updatedJob = await Job.findByIdAndUpdate(
            jobId,
            {
                title, description,
                requirements: requirements ? requirements.split(",") : [],
                salary: Number(salary), location, jobType,
                experienceLevel: Number(experienceLevel),
                position: Number(position)
            },
            { new: true } // Return the updated document
        );

        if (!updatedJob) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Job updated successfully",
            success: true,
            job: updatedJob
        });

    } catch (error) {
        console.log("UPDATE JOB ERROR:", error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};
```

**Key Components Explained:**

- **`findByIdAndUpdate()`**: Mongoose method to find and update a document
- **`{ new: true }`**: Option to return the updated document instead of the original
- **`requirements.split(",")`**: Converts string back to array for storage

---

## Application Controller

**File**: `backend/controllers/application.controller.js`

Handles job applications, applicant tracking, and application status management.

### 1. `applyJob` Function

```javascript
export const applyJob = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;

        if (!jobId) {
            return res.status(400).json({
                message: "Job id is required.",
                success: false
            });
        };

        const existingApplication = await Application.findOne({
            job: jobId,
            applicant: userId
        });

        if (existingApplication) {
            return res.status(400).json({
                message: "You have already applied for this jobs",
                success: false
            });
        }

        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }

        const newApplication = await Application.create({
            job: jobId,
            applicant: userId,
        });

        job.applications.push(newApplication._id);
        await job.save();

        return res.status(201).json({
            message: "Job applied successfully.",
            success: true
        });

    } catch (error) {
        console.log(error);
    }
};
```

**Key Components Explained:**

- **Duplicate Check**: Prevents users from applying to the same job multiple times
- **`job.applications.push()`**: Adds application ID to the job's applications array
- **`job.save()`**: Saves the updated job document with new application

**Frontend Integration Example:**
```javascript
// Frontend: JobDescription.jsx
const res = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`, {
    withCredentials: true
});
```

### 2. `getApplicants` Function

```javascript
export const getApplicants = async (req, res) => {
    try {
        const jobId = req.params.id;

        const job = await Job.findById(jobId)
        .populate({
            path: 'applications',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'applicant'
            }
        });

        if (!job) {
            return res.status(404).json({
                message: 'Job not found.',
                success: false
            });
        };

        return res.status(200).json({
            job,
            success: true
        });

    } catch (error) {
        console.log(error);
    }
};
```

**Key Components Explained:**

- **Nested Population**: First populates applications, then populates applicant data for each application
- **`options: { sort: { createdAt: -1 } }`**: Sorts applications by creation date (newest first)

**Frontend Integration Example:**
```javascript
// Frontend: Applicants.jsx
const res = await axios.get(`${APPLICATION_API_END_POINT}/${params.id}/applicants`, {
    withCredentials: true
});
```

### 3. `updateStatus` Function

```javascript
export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const applicationId = req.params.id;

        if (!status) {
            return res.status(400).json({
                message: 'status is required',
                success: false
            });
        };

        const application = await Application.findOne({
            _id: applicationId
        });

        if (!application) {
            return res.status(404).json({
                message: "Application not found.",
                success: false
            });
        };

        application.status = status.toLowerCase();
        await application.save();

        return res.status(200).json({
            message: "Status updated successfully.",
            success: true
        });

    } catch (error) {
        console.log(error);
    }
};
```

**Key Components Explained:**

- **Status Normalization**: Converts status to lowercase for consistency
- **Direct Update**: Updates the application document directly

**Frontend Integration Example:**
```javascript
// Frontend: ApplicantsTable.jsx
const res = await axios.post(
    `${APPLICATION_API_END_POINT}/status/${id}/update`,
    { status }
);
```

---

## Company Controller

**File**: `backend/controllers/company.controller.js`

Manages company registration, updates, and retrieval.

### 1. `registerCompany` Function

```javascript
export const registerCompany = async (req, res) => {
    try {
        const { companyName } = req.body;

        if (!companyName) {
            return res.status(400).json({
                message: "Company name is required.",
                success: false
            });
        }

        let company = await Company.findOne({ name: companyName });

        if (company) {
            return res.status(400).json({
                message: "You can't register same company.",
                success: false
            });
        };

        company = await Company.create({
            name: companyName,
            userId: req.id
        });

        return res.status(201).json({
            message: "Company registered successfully.",
            company,
            success: true
        });

    } catch (error) {
        console.log(error);
    }
};
```

**Key Components Explained:**

- **Duplicate Prevention**: Checks if company name already exists
- **User Association**: Links company to the user who registered it

**Frontend Integration Example:**
```javascript
// Frontend: CompanyCreate.jsx
const res = await axios.post(`${COMPANY_API_END_POINT}/register`, { companyName }, {
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
});
```

### 2. `updateCompany` Function

```javascript
export const updateCompany = async (req, res) => {
    try {
        const { name, description, website, location } = req.body;
        const file = req.file;

        let logo;
        if (file) {
            const fileUri = getDataUri(file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            logo = cloudResponse.secure_url;
        }

        const updateData = { name, description, website, location };
        if (logo) {
            updateData.logo = logo;
        }

        const company = await Company.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                success: false
            });
        }

        return res.status(200).json({
            message: "Company information updated.",
            success: true
        });

    } catch (error) {
        console.log(error);
    }
};
```

**Key Components Explained:**

- **File Upload**: Handles logo upload via Cloudinary
- **Conditional Update**: Only adds logo to update data if a file was uploaded
- **`getDataUri()`**: Utility function to convert file to data URI

**Frontend Integration Example:**
```javascript
// Frontend: CompanySetup.jsx
const formData = new FormData();
formData.append("name", input.name);
formData.append("description", input.description);
formData.append("website", input.website);
formData.append("location", input.location);
if (input.file) {
    formData.append("file", input.file);
}

const res = await axios.put(`${COMPANY_API_END_POINT}/update/${params.id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    withCredentials: true
});
```

---

## Saved Job Controller

**File**: `backend/controllers/savedJob.controller.js`

Manages job saving/unsaving functionality for users.

### 1. `saveJob` Function

```javascript
export const saveJob = async (req, res) => {
    try {
        const userId = req.id;
        const { jobId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Prevent duplicate save
        if (user.savedJobs.includes(jobId)) {
            return res.status(400).json({
                success: false,
                message: "Job already saved"
            });
        }

        user.savedJobs.push(jobId);
        await user.save();

        res.status(200).json({
            success: true,
            message: "Job saved successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
```

**Key Components Explained:**

- **Duplicate Prevention**: Checks if job is already in saved list
- **Array Push**: Adds job ID to user's savedJobs array
- **User.save()**: Saves the updated user document

**Frontend Integration Example:**
```javascript
// Frontend: Job.jsx
const res = await axios.post(
    `http://localhost:8000/api/v1/user/save/${job._id}`,
    {},
    { withCredentials: true }
);
```

### 2. `getSavedJobs` Function

```javascript
export const getSavedJobs = async (req, res) => {
    try {
        const userId = req.id;

        const user = await User.findById(userId)
            .populate({
                path: "savedJobs",
                populate: {
                    path: "company"   // 🔥 THIS IS THE FIX
                }
            });

        res.status(200).json({
            success: true,
            savedJobs: user.savedJobs
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
```

**Key Components Explained:**

- **Nested Population**: Populates saved job details and their associated companies
- **Complete Data**: Returns full job and company information for display

**Frontend Integration Example:**
```javascript
// Frontend: SavedJobs.jsx
const res = await axios.get(
    "http://localhost:8000/api/v1/user/saved",
    { withCredentials: true }
);
```

---

## User Controller

**File**: `backend/controllers/user.controller.js`

Handles user authentication, registration, login, logout, and profile management.

### 1. `register` Function

```javascript
export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;

        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false,
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists with this email.",
                success: false,
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let cloudResponse = null;
        if (req.file) {
            cloudResponse = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: "auto",
                        type: "upload",
                        folder: "profile_photos",
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });
        }

        const user = await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {
                profilePhoto: cloudResponse ? cloudResponse.secure_url : "",
            },
        });

        return res.status(201).json({
            message: "Account created successfully.",
            success: true,
            user
        });
    } catch (error) {
        console.log(error);
    }
};
```

**Key Components Explained:**

- **bcrypt.hash(password, 10)**: Hashes password with salt rounds for security
- **Cloudinary Upload**: Handles profile photo upload
- **Role-based Registration**: Supports different user roles (student/recruiter)

**Frontend Integration Example:**
```javascript
// Frontend: Signup.jsx
const formData = new FormData();
formData.append("fullname", input.fullname);
formData.append("email", input.email);
formData.append("phoneNumber", input.phoneNumber);
formData.append("password", input.password);
formData.append("role", input.role);
if (input.file) {
    formData.append("file", input.file);
}

const res = await axios.post(`${USER_API_END_POINT}/register`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    withCredentials: true
});
```

### 2. `login` Function

```javascript
export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false,
            });
        }

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            });
        }

        if (role !== user.role) {
            return res.status(400).json({
                message: "Account doesn't exist with current role.",
                success: false,
            });
        }

        const tokenData = {
            userId: user._id,
        };

        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, {
        });

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile,
        };

        return res
            .status(200)
            .cookie("token", token, {
                maxAge: 1 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: "strict",
            })
            .json({
                message: `Welcome back ${user.fullname}`,
                user,
                success: true,
            });
    } catch (error) {
        console.log(error);
    }
};
```

**Key Components Explained:**

- **bcrypt.compare()**: Compares provided password with hashed password
- **JWT Token**: Creates authentication token with 1-day expiration
- **Cookie Settings**: Secure cookie configuration with httpOnly and sameSite
- **Role Verification**: Ensures user is logging in with correct role

**Frontend Integration Example:**
```javascript
// Frontend: Login.jsx
const res = await axios.post(`${USER_API_END_POINT}/login`, input, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true
});
```

### 3. `updateProfile` Function

```javascript
export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;
        const file = req.file;

        let cloudResponse = null;
        if (file) {
            const streamUpload = () => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            resource_type: "auto",
                            type: "upload",
                            folder: "resumes",
                            access_mode: "public",
                        },
                        (error, result) => {
                            if (result) resolve(result);
                            else reject(error);
                        },
                    );
                    stream.end(file.buffer);
                });
            };
            cloudResponse = await streamUpload();
        }

        let skillsArray;
        if (skills) {
            skillsArray = skills.split(",");
        }

        const userId = req.id;
        let user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                message: "User not found.",
                success: false,
            });
        }

        if (fullname) user.fullname = fullname;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (bio) user.profile.bio = bio;
        if (skills) user.profile.skills = skillsArray;

        if (cloudResponse) {
            user.profile.resume = cloudResponse.secure_url;
            user.profile.resumeOriginalName = file.originalname;
        }

        await user.save();

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile,
        };

        return res.status(200).json({
            message: "Profile updated successfully.",
            user,
            success: true,
        });
    } catch (error) {
        console.log(error);
    }
};
```

**Key Components Explained:**

- **Conditional Updates**: Only updates fields that are provided
- **Skills Array**: Converts comma-separated skills to array
- **Resume Upload**: Handles resume file upload with original filename storage
- **Profile Object**: Updates nested profile object with new data

**Frontend Integration Example:**
```javascript
// Frontend: UpdateProfileDialog.jsx
const formData = new FormData();
formData.append("fullname", input.fullname);
formData.append("email", input.email);
formData.append("phoneNumber", input.phoneNumber);
formData.append("bio", input.bio);
formData.append("skills", input.skills);
if (input.file) {
    formData.append("file", input.file);
}

const res = await axios.post(
    `${USER_API_END_POINT}/profile/update`,
    formData,
    {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
    }
);
```

---

## Frontend-Backend Data Flow

### Authentication Flow

1. **User Registration/Login**: Frontend sends credentials to backend
2. **Token Generation**: Backend creates JWT and sets HTTP-only cookie
3. **Protected Routes**: Frontend includes credentials in subsequent requests
4. **User Data**: Backend extracts user ID from token for authorization

### Job Application Flow

1. **Job Listing**: Frontend fetches jobs from backend with filters
2. **Application**: Frontend sends application request with job ID
3. **Validation**: Backend checks for duplicates and job existence
4. **Update**: Backend updates both application and job documents
5. **Response**: Frontend receives confirmation and updates UI

### File Upload Flow

1. **File Selection**: User selects file in frontend form
2. **FormData**: Frontend creates FormData object with file
3. **Upload**: Backend uploads to Cloudinary and gets secure URL
4. **Storage**: Backend stores URL in database
5. **Display**: Frontend uses URL to display uploaded files

### Real-time Updates

- **Redux Store**: Frontend maintains state for immediate UI updates
- **API Calls**: Backend provides fresh data on subsequent requests
- **Optimistic Updates**: Frontend updates UI immediately, reverts on error

This architecture provides a robust, scalable job portal with proper separation of concerns, security measures, and user-friendly interactions.            expiresIn: "1d",
        });

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile,
        };

        return res
            .status(200)
            .cookie("token", token, {
                maxAge: 1 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: "strict",
            })
            .json({
                message: `Welcome back ${user.fullname}`,
                user,
                success: true,
            });
    } catch (error) {
        console.log(error);
    }
};
```

**Key Components Explained:**

- **bcrypt.compare()**: Compares provided password with hashed password
- **JWT Token**: Creates authentication token with 1-day expiration
- **Cookie Settings**: Secure cookie configuration with httpOnly and sameSite
- **Role Verification**: Ensures user is logging in with correct role

**Frontend Integration Example:**
```javascript
// Frontend: Login.jsx
const res = await axios.post(`${USER_API_END_POINT}/login`, input, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true
});
```

### 3. `updateProfile` Function

```javascript
export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;
        const file = req.file;

        let cloudResponse = null;
        if (file) {
            const streamUpload = () => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            resource_type: "auto",
                            type: "upload",
                            folder: "resumes",
                            access_mode: "public",
                        },
                        (error, result) => {
                            if (result) resolve(result);
                            else reject(error);
                        },
                    );
                    stream.end(file.buffer);
                });
            };
            cloudResponse = await streamUpload();
        }

        let skillsArray;
        if (skills) {
            skillsArray = skills.split(",");
        }

        const userId = req.id;
        let user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                message: "User not found.",
                success: false,
            });
        }

        if (fullname) user.fullname = fullname;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (bio) user.profile.bio = bio;
        if (skills) user.profile.skills = skillsArray;

        if (cloudResponse) {
            user.profile.resume = cloudResponse.secure_url;
            user.profile.resumeOriginalName = file.originalname;
        }

        await user.save();

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile,
        };

        return res.status(200).json({
            message: "Profile updated successfully.",
            user,
            success: true,
        });
    } catch (error) {
        console.log(error);
    }
};
```

**Key Components Explained:**

- **Conditional Updates**: Only updates fields that are provided
- **Skills Array**: Converts comma-separated skills to array
- **Resume Upload**: Handles resume file upload with original filename storage
- **Profile Object**: Updates nested profile object with new data

**Frontend Integration Example:**
```javascript
// Frontend: UpdateProfileDialog.jsx
const formData = new FormData();
formData.append("fullname", input.fullname);
formData.append("email", input.email);
formData.append("phoneNumber", input.phoneNumber);
formData.append("bio", input.bio);
formData.append("skills", input.skills);
if (input.file) {
    formData.append("file", input.file);
}

const res = await axios.post(
    `${USER_API_END_POINT}/profile/update`,
    formData,
    {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
    }
);
```

---

## Frontend-Backend Data Flow

### Authentication Flow

1. **User Registration/Login**: Frontend sends credentials to backend
2. **Token Generation**: Backend creates JWT and sets HTTP-only cookie
3. **Protected Routes**: Frontend includes credentials in subsequent requests
4. **User Data**: Backend extracts user ID from token for authorization

### Job Application Flow

1. **Job Listing**: Frontend fetches jobs from backend with filters
2. **Application**: Frontend sends application request with job ID
3. **Validation**: Backend checks for duplicates and job existence
4. **Update**: Backend updates both application and job documents
5. **Response**: Frontend receives confirmation and updates UI

### File Upload Flow

1. **File Selection**: User selects file in frontend form
2. **FormData**: Frontend creates FormData object with file
3. **Upload**: Backend uploads to Cloudinary and gets secure URL
4. **Storage**: Backend stores URL in database
5. **Display**: Frontend uses URL to display uploaded files

### Real-time Updates

- **Redux Store**: Frontend maintains state for immediate UI updates
- **API Calls**: Backend provides fresh data on subsequent requests
- **Optimistic Updates**: Frontend updates UI immediately, reverts on error







