# IncomeUI

## Overview
Simple yet highly modularized SPA as a frontend for IncomeService Rest API

OracleJet project featuring simple crud over houses and payments. Two types of users with coarse and fine grained access control over resources.

## Setup

### Required Platforms
- Node.js 5+ and npm

### Instructions
- To install Ojet CLI execute following command:
     ```
     npm -g install @oracle/ojet-cli
     ```
- Clone project from repository
- Sync project dependencies. Go to project root:
     ```
     ojet restore
     ```
- Run project
     ```
     ojet serve
     ```
- For building the project this command produces a WAR file
     ```
     ojet build --release
     ```

