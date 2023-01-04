# IncomeUI

## Overview
Rest API for managing monthly fees for a neighborhood. 

Microprofile project featuring Jersey Rest API for exposing resources and EJB for backend scheduled tasks. Resources are secured via MP-JWT authorization mechanism. Identity provider is covered as a separated project.

## Setup

### Required Platforms
- Java JDK 8+
- Maven 3+
- Payara Micro 5.194+

### Instructions
- Clone project from repository
- Sync project dependencies. Go to project root:
     ```
     mvn clean install
     ```
- Run project
     ```
     java -jar payara-micro.jar --deploy /path/to/project/target/IncomeService.war
     ```
