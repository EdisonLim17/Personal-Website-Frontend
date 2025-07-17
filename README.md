# Personal Portfolio Website – Frontend

This repository contains the frontend code for my personal portfolio website, built using **HTML, CSS, and JavaScript** and hosted on **AWS S3** with **CloudFront** for global delivery. The site features sections about me, my resume, and personal projects, with a live visitor counter integrated via the backend, which can be found [here](https://github.com/EdisonLim17/Personal-Website-Backend).

### 🌐 Live Site
[https://edisonlim.ca](https://edisonlim.ca)

---

## Architecture
![Image of architecture](/src/assets/Personal-Website-Frontend-AWS-Architecture.jpeg)

---

## 🚀 Features

- Fully responsive design using HTML, CSS, and JavaScript
- Custom domain managed through Route 53
- Delivered via CloudFront with HTTPS enabled via SSL certificate provisioned by ACM
- CI/CD: Automatic deployment to S3 on push to `main` using GitHub Actions

---

## 🧰 Tech Stack

- **HTML5 / CSS3 / JavaScript**
- **AWS S3** – static site hosting
- **AWS CloudFront** – CDN for fast, secure content delivery
- **AWS Route 53** – custom domain management
- **AWS Certificate Manager (ACM)** – SSL certificate provisioning for HTTPS
- **GitHub Actions** – CI/CD pipeline

---

## 🔧 CI/CD Workflow

Whenever changes are pushed to the `main` branch:
1. GitHub Actions syncs the `/src` folder to the S3 bucket
2. GitHub Actions invalidates CloudFront's cache to serve the updated content globally