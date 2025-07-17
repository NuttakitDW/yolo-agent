# Optimizing Dependency Management and Deployment for Serverless Python Applications with uv and Pants

**Speakers:** Arnel Jan Sarmiento

**Session Type:** 30-mins talk session

**Level:** Intermediate

**Language:** English

**Category:** Serverless

## Abstract

In this talk, we will explore how to streamline the development and deployment of serverless Python applications by combining the power of the Pants build system and the speed of uv. By leveraging Pants’ dependency inference and caching capabilities alongside uv’s unparalleled installation speeds, we’ll demonstrate a seamless workflow for packaging Lambda functions and deploying them efficiently with Terraform. Through pre-recorded demos, we’ll showcase how this setup accelerates builds, reduces bloat, and simplifies the deployment process in an actual application. Deploying serverless Python applications often comes with significant challenges that hinder developer productivity and application performance. Key issues include: - Slow Build Times: Docker-based workflows for cross-platform builds require emulating target environments, resulting in lengthy build processes. - Dependency Bloat: Traditional Python packaging tools lack the ability to exclude unused dependencies, unlike tree-shaking mechanisms available in Node.js. This results in unnecessarily large deployment artifacts, slowing down cold starts. - Tedious Management: Coordinating dependencies for multiple Lambda functions with varied requirements is time-consuming and error-prone. How Pants Can Help: Pants’ dependency inference automatically identifies and includes only the dependencies required by each Lambda function, effectively mimicking a tree-shaking process. This reduces artifact size and eliminates the need for manual dependency pruning. Its native caching and parallel builds drastically accelerate the packaging process, even for complex, multi-function setups. Why uv? uv complements Pants by offering unparalleled speed for dependency installation—up to 100x faster than pip. Together, these tools provide an efficient, streamlined approach to managing dependencies and building serverless Python applications. This session will include pre-recorded demos showcasing how to: - Configure Pants to optimize dependency management and build lean, platform-specific Lambda artifacts. - Use uv to install and manage dependencies with exceptional speed. - Deploy the final packaged Lambda functions using Terraform to demonstrate an end-to-end workflow. Finally, we’ll discuss the good use cases for this setup (e.g., multi-function serverless apps, CI/CD pipelines) and drawbacks (e.g., initial setup complexity, edge cases in dependency inference).


## About the Speaker(s)

### Arnel Jan Sarmiento

*Speaker bio will be available soon.*

