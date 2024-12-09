[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![License][license-shield]][license-url]

<br />
<div align="center">
  <a href="https://sigmaacademy.my.id/">
    <img src="https://sigmaacademy.my.id/icon.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Sigma Academy</h3>

  <p align="center">
    FullStack Online Course Platform with MongoDB database
    <br />
    <br />
    <a href="https://sigmaacademy.my.id">View Demo</a>
    ·
    <a href="https://github.com/gbagush/sigma-academy/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/gbagush/sigma-academy/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

This repository contains the source code for Final Project the Database course at the [State University of Surabaya](https://www.unesa.ac.id/). The course is taught in the [Informatics Department](https://ti.ft.unesa.ac.id/) of the university.

<!-- ABOUT THE PROJECT -->

## ❓About The Project

Sigma Academy is an online course platform developed as a final project for the Database course. This project aims to demonstrate the implementation of MongoDB as a database solution for storing and managing course data, user information, and other relevant data.

## ✨Features

- **Multi-Role Auth System:** Allows different user roles (administrators, instructors, students) to access the platform with specific permissions, enhancing security and usability.
- **Course Management:** Enables instructors to create, update, and organize courses, including adding materials like videos and quizzes for a structured learning experience.
- **Transations:** Facilitates secure payments for course enrollments through an integrated payment gateway, ensuring safe financial transactions.
- **Discussion Forum:** Provides a space for students and instructors to engage in discussions, ask questions, and share insights, fostering community interaction.
- **Course Rating and Reviews:** Allows students to rate courses and leave feedback, helping future learners make informed decisions and providing instructors with valuable insights.
- **Certificate Generation:** Issues digital certificates upon course completion, which can be downloaded or shared, recognizing students' achievements.

## 🔧Built With

<img src="https://skillicons.dev/icons?i=mongodb" width="64">
<img src="https://skillicons.dev/icons?i=nodejs" width="64">
<img src="https://skillicons.dev/icons?i=typescript" width="64">
<img src="https://skillicons.dev/icons?i=nextjs" width="64">
<img src="https://skillicons.dev/icons?i=tailwind" width="64">
<img src="https://github.com/user-attachments/assets/9027732b-de8c-4c4b-a065-235e15e33e5e" width="64">
<img src="https://github.com/user-attachments/assets/e4bd419a-2a4a-459a-ba9a-d3324e693c4d" width="64">

## 🚀Getting Started

### Prerequisties

To set up the Sigma Academy project, ensure you have the following installed:

- [Node.js](https://nodejs.org/en) (with npm)
- [Git](https://git-scm.com/)
- [MongoDB Server](https://www.mongodb.com/)
- [SMTP Server](https://aws.amazon.com/id/what-is/smtp/)
- [Cloudinary API](https://cloudinary.com/)
- [Xendit API](https://www.xendit.co/)

### Setting Up

To set up the Sigma Academy project, follow these steps:

- **Clone the Repository:**

  Open your terminal and run the following command to clone the repository:

  ```bash
  git clone https://github.com/gbagush/sigma-academy.git
  ```

- **Move to the Project Folder:**

  Navigate into the cloned project directory:

  ```bash
  cd sigma-academy
  ```

- **Install Dependencies:**

  Install the necessary dependencies using npm:

  ```bash
  npm install
  ```

- **Setup Environment Variables:**

  Create a `.env` file in the root of your project directory and set up your environment variables. Here’s a template you can use:

  ```
  # SITE CONFIG
  NEXT_PUBLIC_BASE_URL=http://localhost:3000 # FOR DEV MODE

  # MONGO DB
  MONGODB_URI=mongodb://localhost:27017/sigmaAcademy
  MONGODB_DATABASE=sigmaAcademy

  # JWT
  JWT_SECRET=your_jwt_secret_key_here

  # MAIL SERVER
  MAIL_HOST=smtp.yourmailprovider.com
  MAIL_PORT=465
  MAIL_SECURE=true

  MAIL_DOMAIN=yourmailprovider.com

  # Notification Account
  MAIL_NAME=Sigma Academy
  MAIL_USER=no-reply@yourmailprovider.com
  MAIL_PASS=your_secret_password
  MAIL_ADDRESS=no-reply@yourmailprovider.com

  # CLOUDINARY
  CLOUDINARY_CLOUD_NAME=your_cloud_name_here
  CLOUDINARY_API_KEY=your_api_key_here
  CLOUDINARY_API_SECRET=your_api_secret_here

  # XENDIT
  XENDIT_API_KEY=your_xendit_api_key_here
  ```

  Replace value with your own.

#### Development Mode

- **Start the Application (Development Mode):**

  After setting up the environment variables, you can start the application with:

  ```bash
  npm run dev
  ```

#### Production Mode

- **Build the Project:**

  First, you need to create a production build of your application. Run the following command in your terminal:

  ```bash
  npm run build
  ```

  This command compiles your application and generates a `build` directory containing the optimized production files.

- **Start the Application:**

  After building the project, you can start the application using:

  ```bash
  npm run start
  ```

  This command will start your application in production mode, serving the files from the `build` directory.

#### Additional Notes:

- Ensure that your environment variables are properly set in your .env file for production use.
- You may need to configure a web server (like Nginx or Apache) to serve your application efficiently in a production environment.
- For optimal performance, consider setting caching headers for static assets as recommended in deployment best practices.

## ✊ Show Your Support

Give me a ⭐ if you like this project.

[contributors-shield]: https://img.shields.io/github/contributors/gbagush/sigma-academy.svg?style=for-the-badge
[contributors-url]: https://github.com/gbagush/sigma-academy/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/gbagush/sigma-academy.svg?style=for-the-badge
[forks-url]: https://github.com/gbagush/sigma-academy/network/members
[stars-shield]: https://img.shields.io/github/stars/gbagush/sigma-academy.svg?style=for-the-badge
[stars-url]: https://github.com/gbagush/sigma-academy/stargazers
[issues-shield]: https://img.shields.io/github/issues/gbagush/sigma-academy.svg?style=for-the-badge
[issues-url]: https://github.com/gbagush/sigma-academy/issues
[license-shield]: https://img.shields.io/github/license/gbagush/sigma-academy.svg?style=for-the-badge
[license-url]: https://github.com/gbagush/sigma-academy/blob/master/LICENSE.txt
