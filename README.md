# Automated Disaster Recovery and Backup Solution for To-Do App

This project implements an **Automated Disaster Recovery and Backup Solution** for a to-do application that utilizes **AWS RDS (MySQL)** as its database. The solution includes automated backups, manual snapshots, and a multi-AZ deployment for high availability, ensuring data integrity and availability.

## Project Overview

The primary goal of this project is to implement a robust disaster recovery and backup strategy for a to-do application. By using AWS services, this solution ensures that user data is consistently backed up and can be restored quickly in the event of a failure.

## Technologies Used

- **AWS RDS (MySQL)**: For managing the database.
- **AWS S3**: For storing manual snapshots and backups.
- **AWS Lambda**: For creating on-demand RDS snapshots.
- **AWS Backup**: For managing backup plans and schedules.
- **AWS CloudWatch**: For monitoring and alerts.

## Architecture

1. **Frontend**: A web interface built for managing tasks.
2. **Backend**: Microservices handling CRUD operations and user authentication.
3. **Database**: AWS RDS (MySQL) instance for storing tasks and user data.
4. **Backup**: Automated backups configured for daily snapshots with AWS Backup.

## Features

- Automated daily backups of the RDS instance.
- Manual snapshot creation via AWS Lambda function.
- Multi-AZ deployment for high availability and failover.
- Monitoring and alerting setup via AWS CloudWatch.
